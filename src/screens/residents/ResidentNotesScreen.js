import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { 
  Appbar, 
  Card, 
  FAB, 
  Avatar, 
  Chip,
  IconButton,
  Divider,
  TextInput,
  Button,
  Portal,
  Modal
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Mock data for notes
const mockNotesData = [
  {
    id: '1',
    title: 'Kiểm tra sức khỏe định kỳ',
    content: 'Cư dân có dấu hiệu cải thiện trong việc ăn uống. Huyết áp ổn định trong khoảng bình thường.',
    author: 'Bs. Nguyễn Văn An',
    authorRole: 'Bác sĩ',
    createdAt: new Date('2024-01-15T10:30:00'),
    category: 'medical',
    priority: 'normal',
    isPrivate: false
  },
  {
    id: '2',
    title: 'Ghi chú hoạt động hàng ngày',
    content: 'Cư dân tham gia tích cực vào các hoạt động thể dục buổi sáng. Tâm trạng vui vẻ, giao tiếp tốt với các cư dân khác.',
    author: 'Điều dưỡng Trần Thị Mai',
    authorRole: 'Điều dưỡng',
    createdAt: new Date('2024-01-14T14:20:00'),
    category: 'daily',
    priority: 'low',
    isPrivate: false
  },
  {
    id: '3',
    title: 'Phản ứng với thuốc mới',
    content: 'Cần theo dõi chặt chẽ phản ứng với thuốc huyết áp mới. Đã thông báo cho bác sĩ điều trị.',
    author: 'Dược sĩ Lê Văn Hùng',
    authorRole: 'Dược sĩ',
    createdAt: new Date('2024-01-13T16:45:00'),
    category: 'medication',
    priority: 'high',
    isPrivate: true
  }
];

const ResidentNotesScreen = ({ navigation, route }) => {
  const [notes, setNotes] = useState(mockNotesData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'daily',
    priority: 'normal',
    isPrivate: false
  });
  const residentName = route?.params?.residentName || 'Cư dân';

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'medical':
        return { label: 'Y tế', color: COLORS.error, icon: 'medical-bag' };
      case 'medication':
        return { label: 'Thuốc', color: COLORS.warning, icon: 'pill' };
      case 'daily':
        return { label: 'Hàng ngày', color: COLORS.success, icon: 'calendar-check' };
      default:
        return { label: 'Khác', color: COLORS.textSecondary, icon: 'note' };
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'high':
        return { label: 'Cao', color: COLORS.error };
      case 'normal':
        return { label: 'Bình thường', color: COLORS.warning };
      case 'low':
        return { label: 'Thấp', color: COLORS.success };
      default:
        return { label: 'Bình thường', color: COLORS.warning };
    }
  };

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề và nội dung ghi chú');
      return;
    }

    const note = {
      id: Date.now().toString(),
      ...newNote,
      author: 'Người dùng hiện tại',
      authorRole: 'Nhân viên',
      createdAt: new Date()
    };

    setNotes([note, ...notes]);
    setNewNote({
      title: '',
      content: '',
      category: 'daily',
      priority: 'normal',
      isPrivate: false
    });
    setShowAddModal(false);
    Alert.alert('Thành công', 'Đã thêm ghi chú mới');
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa ghi chú này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            setNotes(notes.filter(note => note.id !== noteId));
          }
        }
      ]
    );
  };

  const renderNoteCard = (note) => {
    const categoryInfo = getCategoryInfo(note.category);
    const priorityInfo = getPriorityInfo(note.priority);

    return (
      <Card key={note.id} style={styles.noteCard}>
        <Card.Content>
          <View style={styles.noteHeader}>
            <View style={styles.noteMetadata}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <View style={styles.chips}>
                <Chip 
                  icon={categoryInfo.icon}
                  style={[styles.categoryChip, { backgroundColor: categoryInfo.color + '15' }]}
                  textStyle={[styles.chipText, { color: categoryInfo.color }]}
                  compact
                >
                  {categoryInfo.label}
                </Chip>
                <Chip 
                  style={[styles.priorityChip, { backgroundColor: priorityInfo.color + '15' }]}
                  textStyle={[styles.chipText, { color: priorityInfo.color }]}
                  compact
                >
                  {priorityInfo.label}
                </Chip>
                {note.isPrivate && (
                  <Chip 
                    icon="lock"
                    style={styles.privateChip}
                    textStyle={styles.privateChipText}
                    compact
                  >
                    Riêng tư
                  </Chip>
                )}
              </View>
            </View>
            <IconButton
              icon="delete"
              size={20}
              iconColor={COLORS.error}
              onPress={() => handleDeleteNote(note.id)}
            />
          </View>

          <Text style={styles.noteContent}>{note.content}</Text>

          <Divider style={styles.divider} />

          <View style={styles.noteFooter}>
            <View style={styles.authorInfo}>
              <Avatar.Icon 
                size={32} 
                icon="account" 
                style={styles.authorAvatar}
              />
              <View>
                <Text style={styles.authorName}>{note.author}</Text>
                <Text style={styles.authorRole}>{note.authorRole}</Text>
              </View>
            </View>
            <Text style={styles.noteDate}>
              {format(note.createdAt, 'dd/MM/yyyy HH:mm', { locale: vi })}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Ghi chú - ${residentName}`} />
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ghi chú theo dõi</Text>
          <Text style={styles.headerSubtitle}>
            {notes.length} ghi chú
          </Text>
        </View>

        {notes.length > 0 ? (
          notes.map(renderNoteCard)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons 
              name="note-add" 
              size={64} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.emptyTitle}>Chưa có ghi chú nào</Text>
            <Text style={styles.emptySubtitle}>
              Nhấn nút thêm để tạo ghi chú đầu tiên
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddModal(true)}
        label="Thêm ghi chú"
      />

      {/* Add Note Modal */}
      <Portal>
        <Modal 
          visible={showAddModal} 
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Thêm ghi chú mới</Text>
          
          <TextInput
            label="Tiêu đề"
            value={newNote.title}
            onChangeText={(text) => setNewNote({...newNote, title: text})}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Nội dung"
            value={newNote.content}
            onChangeText={(text) => setNewNote({...newNote, content: text})}
            style={styles.textArea}
            mode="outlined"
            multiline
            numberOfLines={4}
          />

          <View style={styles.optionsRow}>
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Loại:</Text>
              <View style={styles.optionChips}>
                {['daily', 'medical', 'medication'].map(cat => {
                  const info = getCategoryInfo(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setNewNote({...newNote, category: cat})}
                    >
                      <Chip 
                        selected={newNote.category === cat}
                        style={styles.optionChip}
                      >
                        {info.label}
                      </Chip>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Mức độ:</Text>
              <View style={styles.optionChips}>
                {['low', 'normal', 'high'].map(priority => {
                  const info = getPriorityInfo(priority);
                  return (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setNewNote({...newNote, priority})}
                    >
                      <Chip 
                        selected={newNote.priority === priority}
                        style={styles.optionChip}
                      >
                        {info.label}
                      </Chip>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setShowAddModal(false)}
              style={styles.cancelButton}
            >
              Hủy
            </Button>
            <Button 
              mode="contained" 
              onPress={handleAddNote}
              style={styles.saveButton}
            >
              Lưu
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
  },
  header: {
    marginBottom: SIZES.large,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  headerSubtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  noteCard: {
    marginBottom: SIZES.medium,
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  noteMetadata: {
    flex: 1,
  },
  noteTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.small / 2,
  },
  categoryChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
  },
  priorityChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
  },
  privateChip: {
    backgroundColor: COLORS.textSecondary + '15',
    marginBottom: SIZES.small / 2,
  },
  chipText: {
    fontSize: SIZES.body3,
  },
  privateChipText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  noteContent: {
    ...FONTS.body2,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SIZES.medium,
  },
  divider: {
    marginVertical: SIZES.medium,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SIZES.small,
  },
  authorName: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  authorRole: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  noteDate: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxlarge * 2,
  },
  emptyTitle: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
    marginTop: SIZES.medium,
    marginBottom: SIZES.small,
  },
  emptySubtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SIZES.medium,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  bottomSpace: {
    height: 100,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    margin: SIZES.large,
    padding: SIZES.large,
    borderRadius: SIZES.radius,
    maxHeight: '80%',
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  input: {
    marginBottom: SIZES.medium,
  },
  textArea: {
    marginBottom: SIZES.medium,
  },
  optionsRow: {
    marginBottom: SIZES.large,
  },
  optionGroup: {
    marginBottom: SIZES.medium,
  },
  optionLabel: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  optionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.small / 2,
  },
  optionChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.medium,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default ResidentNotesScreen; 