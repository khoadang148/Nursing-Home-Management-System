// Professional audit logging system for healthcare compliance
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

// Audit event types for healthcare operations
export const AUDIT_EVENTS = {
  // Authentication events
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // Resident management
  RESIDENT_CREATED: 'RESIDENT_CREATED',
  RESIDENT_UPDATED: 'RESIDENT_UPDATED',
  RESIDENT_DELETED: 'RESIDENT_DELETED',
  RESIDENT_VIEWED: 'RESIDENT_VIEWED',
  RESIDENT_ADMITTED: 'RESIDENT_ADMITTED',
  RESIDENT_DISCHARGED: 'RESIDENT_DISCHARGED',
  
  // Medical records
  MEDICAL_RECORD_ACCESSED: 'MEDICAL_RECORD_ACCESSED',
  MEDICAL_RECORD_UPDATED: 'MEDICAL_RECORD_UPDATED',
  VITAL_SIGNS_RECORDED: 'VITAL_SIGNS_RECORDED',
  CARE_PLAN_CREATED: 'CARE_PLAN_CREATED',
  CARE_PLAN_UPDATED: 'CARE_PLAN_UPDATED',
  
  // Medication management
  MEDICATION_ADMINISTERED: 'MEDICATION_ADMINISTERED',
  MEDICATION_REFUSED: 'MEDICATION_REFUSED',
  MEDICATION_PRESCRIBED: 'MEDICATION_PRESCRIBED',
  MEDICATION_DISCONTINUED: 'MEDICATION_DISCONTINUED',
  MEDICATION_SCHEDULE_CHANGED: 'MEDICATION_SCHEDULE_CHANGED',
  
  // Staff activities
  STAFF_CREATED: 'STAFF_CREATED',
  STAFF_UPDATED: 'STAFF_UPDATED',
  STAFF_DEACTIVATED: 'STAFF_DEACTIVATED',
  SHIFT_STARTED: 'SHIFT_STARTED',
  SHIFT_ENDED: 'SHIFT_ENDED',
  
  // Tasks and activities
  TASK_CREATED: 'TASK_CREATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  ACTIVITY_SCHEDULED: 'ACTIVITY_SCHEDULED',
  ACTIVITY_COMPLETED: 'ACTIVITY_COMPLETED',
  
  // Emergency events
  EMERGENCY_ALERT: 'EMERGENCY_ALERT',
  INCIDENT_REPORTED: 'INCIDENT_REPORTED',
  FALL_REPORTED: 'FALL_REPORTED',
  
  // System events
  DATA_EXPORT: 'DATA_EXPORT',
  BACKUP_CREATED: 'BACKUP_CREATED',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  
  // Family communication
  FAMILY_NOTIFICATION_SENT: 'FAMILY_NOTIFICATION_SENT',
  VISIT_SCHEDULED: 'VISIT_SCHEDULED',
  VISIT_COMPLETED: 'VISIT_COMPLETED'
};

// Risk levels for audit events
export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Compliance categories
export const COMPLIANCE_CATEGORIES = {
  HIPAA: 'HIPAA',
  MEDICATION_SAFETY: 'MEDICATION_SAFETY',
  CARE_QUALITY: 'CARE_QUALITY',
  STAFF_MANAGEMENT: 'STAFF_MANAGEMENT',
  EMERGENCY_RESPONSE: 'EMERGENCY_RESPONSE',
  FAMILY_COMMUNICATION: 'FAMILY_COMMUNICATION'
};

class AuditLogger {
  constructor() {
    this.storageKey = 'audit_logs';
    this.maxLogsInMemory = 1000;
    this.retentionDays = 2555; // 7 years for healthcare compliance
  }

  // Create audit log entry
  async log(eventType, details = {}) {
    try {
      const logEntry = {
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        eventType,
        userId: details.userId || await this.getCurrentUserId(),
        userRole: details.userRole || await this.getCurrentUserRole(),
        sessionId: details.sessionId || await this.getSessionId(),
        ipAddress: details.ipAddress || 'mobile_app',
        deviceInfo: details.deviceInfo || await this.getDeviceInfo(),
        riskLevel: this.determineRiskLevel(eventType),
        complianceCategory: this.getComplianceCategory(eventType),
        details: {
          ...details,
          timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        checksum: null // Will be calculated after creating the entry
      };

      // Calculate checksum for integrity
      logEntry.checksum = this.calculateChecksum(logEntry);

      // Store the log
      await this.storeLog(logEntry);

      // Send to server if critical
      if (logEntry.riskLevel === RISK_LEVELS.CRITICAL) {
        await this.sendCriticalLogToServer(logEntry);
      }

      return logEntry;
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Fallback logging to ensure we don't lose critical events
      await this.fallbackLog(eventType, details, error);
    }
  }

  // Determine risk level based on event type
  determineRiskLevel(eventType) {
    const criticalEvents = [
      AUDIT_EVENTS.EMERGENCY_ALERT,
      AUDIT_EVENTS.INCIDENT_REPORTED,
      AUDIT_EVENTS.FALL_REPORTED,
      AUDIT_EVENTS.MEDICATION_REFUSED,
      AUDIT_EVENTS.RESIDENT_DISCHARGED
    ];

    const highRiskEvents = [
      AUDIT_EVENTS.MEDICATION_ADMINISTERED,
      AUDIT_EVENTS.MEDICATION_PRESCRIBED,
      AUDIT_EVENTS.VITAL_SIGNS_RECORDED,
      AUDIT_EVENTS.CARE_PLAN_UPDATED,
      AUDIT_EVENTS.MEDICAL_RECORD_UPDATED
    ];

    const mediumRiskEvents = [
      AUDIT_EVENTS.RESIDENT_CREATED,
      AUDIT_EVENTS.RESIDENT_UPDATED,
      AUDIT_EVENTS.STAFF_CREATED,
      AUDIT_EVENTS.TASK_COMPLETED
    ];

    if (criticalEvents.includes(eventType)) return RISK_LEVELS.CRITICAL;
    if (highRiskEvents.includes(eventType)) return RISK_LEVELS.HIGH;
    if (mediumRiskEvents.includes(eventType)) return RISK_LEVELS.MEDIUM;
    return RISK_LEVELS.LOW;
  }

  // Get compliance category for event
  getComplianceCategory(eventType) {
    const medicationEvents = [
      AUDIT_EVENTS.MEDICATION_ADMINISTERED,
      AUDIT_EVENTS.MEDICATION_REFUSED,
      AUDIT_EVENTS.MEDICATION_PRESCRIBED,
      AUDIT_EVENTS.MEDICATION_DISCONTINUED
    ];

    const hipaaEvents = [
      AUDIT_EVENTS.MEDICAL_RECORD_ACCESSED,
      AUDIT_EVENTS.MEDICAL_RECORD_UPDATED,
      AUDIT_EVENTS.RESIDENT_VIEWED,
      AUDIT_EVENTS.DATA_EXPORT
    ];

    const careQualityEvents = [
      AUDIT_EVENTS.VITAL_SIGNS_RECORDED,
      AUDIT_EVENTS.CARE_PLAN_CREATED,
      AUDIT_EVENTS.CARE_PLAN_UPDATED,
      AUDIT_EVENTS.TASK_COMPLETED
    ];

    const staffEvents = [
      AUDIT_EVENTS.STAFF_CREATED,
      AUDIT_EVENTS.STAFF_UPDATED,
      AUDIT_EVENTS.SHIFT_STARTED,
      AUDIT_EVENTS.SHIFT_ENDED
    ];

    const emergencyEvents = [
      AUDIT_EVENTS.EMERGENCY_ALERT,
      AUDIT_EVENTS.INCIDENT_REPORTED,
      AUDIT_EVENTS.FALL_REPORTED
    ];

    const familyEvents = [
      AUDIT_EVENTS.FAMILY_NOTIFICATION_SENT,
      AUDIT_EVENTS.VISIT_SCHEDULED,
      AUDIT_EVENTS.VISIT_COMPLETED
    ];

    if (medicationEvents.includes(eventType)) return COMPLIANCE_CATEGORIES.MEDICATION_SAFETY;
    if (hipaaEvents.includes(eventType)) return COMPLIANCE_CATEGORIES.HIPAA;
    if (careQualityEvents.includes(eventType)) return COMPLIANCE_CATEGORIES.CARE_QUALITY;
    if (staffEvents.includes(eventType)) return COMPLIANCE_CATEGORIES.STAFF_MANAGEMENT;
    if (emergencyEvents.includes(eventType)) return COMPLIANCE_CATEGORIES.EMERGENCY_RESPONSE;
    if (familyEvents.includes(eventType)) return COMPLIANCE_CATEGORIES.FAMILY_COMMUNICATION;
    
    return COMPLIANCE_CATEGORIES.CARE_QUALITY; // Default
  }

  // Store log entry
  async storeLog(logEntry) {
    try {
      const existingLogs = await this.getLogs();
      const updatedLogs = [logEntry, ...existingLogs].slice(0, this.maxLogsInMemory);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to store audit log:', error);
    }
  }

  // Get all logs
  async getLogs(filters = {}) {
    try {
      const logsJson = await AsyncStorage.getItem(this.storageKey);
      let logs = logsJson ? JSON.parse(logsJson) : [];

      // Apply filters
      if (filters.eventType) {
        logs = logs.filter(log => log.eventType === filters.eventType);
      }
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.riskLevel) {
        logs = logs.filter(log => log.riskLevel === filters.riskLevel);
      }
      if (filters.complianceCategory) {
        logs = logs.filter(log => log.complianceCategory === filters.complianceCategory);
      }
      if (filters.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
      }

      return logs;
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  // Get logs for compliance reporting
  async getComplianceReport(category, startDate, endDate) {
    const logs = await this.getLogs({
      complianceCategory: category,
      startDate,
      endDate
    });

    return {
      category,
      period: { startDate, endDate },
      totalEvents: logs.length,
      riskBreakdown: this.getRiskBreakdown(logs),
      eventBreakdown: this.getEventBreakdown(logs),
      userActivity: this.getUserActivityBreakdown(logs),
      logs: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    };
  }

  // Get risk breakdown
  getRiskBreakdown(logs) {
    return logs.reduce((breakdown, log) => {
      breakdown[log.riskLevel] = (breakdown[log.riskLevel] || 0) + 1;
      return breakdown;
    }, {});
  }

  // Get event breakdown
  getEventBreakdown(logs) {
    return logs.reduce((breakdown, log) => {
      breakdown[log.eventType] = (breakdown[log.eventType] || 0) + 1;
      return breakdown;
    }, {});
  }

  // Get user activity breakdown
  getUserActivityBreakdown(logs) {
    return logs.reduce((breakdown, log) => {
      const userKey = `${log.userId}_${log.userRole}`;
      if (!breakdown[userKey]) {
        breakdown[userKey] = {
          userId: log.userId,
          userRole: log.userRole,
          eventCount: 0,
          lastActivity: log.timestamp
        };
      }
      breakdown[userKey].eventCount++;
      if (new Date(log.timestamp) > new Date(breakdown[userKey].lastActivity)) {
        breakdown[userKey].lastActivity = log.timestamp;
      }
      return breakdown;
    }, {});
  }

  // Clean old logs based on retention policy
  async cleanOldLogs() {
    try {
      const logs = await this.getLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const filteredLogs = logs.filter(log => 
        new Date(log.timestamp) > cutoffDate
      );

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(filteredLogs));
      return logs.length - filteredLogs.length; // Return number of logs cleaned
    } catch (error) {
      console.error('Failed to clean old logs:', error);
      return 0;
    }
  }

  // Export logs for compliance
  async exportLogs(filters = {}) {
    const logs = await this.getLogs(filters);
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      filters,
      totalLogs: logs.length,
      logs: logs.map(log => ({
        ...log,
        exportedAt: new Date().toISOString()
      }))
    };

    // Log the export action
    await this.log(AUDIT_EVENTS.DATA_EXPORT, {
      exportFilters: filters,
      exportedLogCount: logs.length
    });

    return exportData;
  }

  // Helper methods
  generateLogId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getCurrentUserId() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData).id : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async getCurrentUserRole() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData).role : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  async getSessionId() {
    try {
      let sessionId = await AsyncStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch {
      return 'unknown';
    }
  }

  async getDeviceInfo() {
    // In a real app, you would get actual device info
    return {
      platform: 'mobile',
      userAgent: 'NursingHomeApp/1.0.0'
    };
  }

  calculateChecksum(logEntry) {
    // Simple checksum for integrity verification
    const dataString = JSON.stringify({
      timestamp: logEntry.timestamp,
      eventType: logEntry.eventType,
      userId: logEntry.userId,
      details: logEntry.details
    });
    
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  async sendCriticalLogToServer(logEntry) {
    // In a real app, this would send critical logs to a secure server
    console.warn('CRITICAL AUDIT EVENT:', logEntry);
  }

  async fallbackLog(eventType, details, error) {
    try {
      const fallbackEntry = {
        timestamp: new Date().toISOString(),
        eventType: 'AUDIT_LOG_FAILED',
        originalEventType: eventType,
        error: error.message,
        details
      };
      
      const fallbackLogs = await AsyncStorage.getItem('fallback_audit_logs') || '[]';
      const logs = JSON.parse(fallbackLogs);
      logs.push(fallbackEntry);
      await AsyncStorage.setItem('fallback_audit_logs', JSON.stringify(logs.slice(-100)));
    } catch (fallbackError) {
      console.error('Fallback logging also failed:', fallbackError);
    }
  }
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Convenience methods for common audit events
export const auditLog = {
  // Authentication
  login: (userId, userRole) => auditLogger.log(AUDIT_EVENTS.LOGIN, { userId, userRole }),
  logout: (userId) => auditLogger.log(AUDIT_EVENTS.LOGOUT, { userId }),
  loginFailed: (email, reason) => auditLogger.log(AUDIT_EVENTS.LOGIN_FAILED, { email, reason }),

  // Resident management
  residentCreated: (residentId, createdBy) => auditLogger.log(AUDIT_EVENTS.RESIDENT_CREATED, { residentId, createdBy }),
  residentUpdated: (residentId, updatedBy, changes) => auditLogger.log(AUDIT_EVENTS.RESIDENT_UPDATED, { residentId, updatedBy, changes }),
  residentViewed: (residentId, viewedBy) => auditLogger.log(AUDIT_EVENTS.RESIDENT_VIEWED, { residentId, viewedBy }),

  // Medical records
  vitalSignsRecorded: (residentId, vitals, recordedBy) => auditLogger.log(AUDIT_EVENTS.VITAL_SIGNS_RECORDED, { residentId, vitals, recordedBy }),
  carePlanUpdated: (residentId, carePlanId, updatedBy) => auditLogger.log(AUDIT_EVENTS.CARE_PLAN_UPDATED, { residentId, carePlanId, updatedBy }),

  // Medication
  medicationAdministered: (residentId, medicationId, administeredBy, time) => 
    auditLogger.log(AUDIT_EVENTS.MEDICATION_ADMINISTERED, { residentId, medicationId, administeredBy, time }),
  medicationRefused: (residentId, medicationId, reason, witnessedBy) => 
    auditLogger.log(AUDIT_EVENTS.MEDICATION_REFUSED, { residentId, medicationId, reason, witnessedBy }),

  // Emergency events
  emergencyAlert: (residentId, alertType, severity, respondedBy) => 
    auditLogger.log(AUDIT_EVENTS.EMERGENCY_ALERT, { residentId, alertType, severity, respondedBy }),
  incidentReported: (residentId, incidentType, reportedBy, description) => 
    auditLogger.log(AUDIT_EVENTS.INCIDENT_REPORTED, { residentId, incidentType, reportedBy, description }),

  // Tasks
  taskCompleted: (taskId, residentId, completedBy, completionNotes) => 
    auditLogger.log(AUDIT_EVENTS.TASK_COMPLETED, { taskId, residentId, completedBy, completionNotes }),

  // Family communication
  familyNotificationSent: (residentId, familyMemberId, notificationType, content) => 
    auditLogger.log(AUDIT_EVENTS.FAMILY_NOTIFICATION_SENT, { residentId, familyMemberId, notificationType, content })
};

export default auditLogger; 