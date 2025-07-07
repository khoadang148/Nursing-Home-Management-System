# 🎯 Hướng dẫn Chi tiết QR Code cho NHMS

## 🔴 QUAN TRỌNG: Cần thêm file QR Code

### Hiện tại
- App đang cố gắng load file: `qr-code.png`
- File này CHƯA TỒN TẠI nên sẽ bị lỗi khi chạy

### Cần làm NGAY
1. **Lưu hình ảnh QR** từ hình 3 mà bạn đã gửi
2. **Đổi tên thành `qr-code.png`**
3. **Copy vào thư mục này**: `assets/images/qr-code.png`

## 📱 Hướng dẫn Tối ưu QR Code

### 📏 Thông số Kỹ thuật
- **Kích thước**: Tối thiểu 512x512 pixels
- **Định dạng**: PNG (không nén)
- **Tỷ lệ**: Vuông (1:1)
- **Nền**: Trắng hoàn toàn (#FFFFFF)
- **Mã**: Đen đậm (#000000)
- **Margin**: Ít nhất 4 module trắng xung quanh

### 🔧 Cách Làm Rõ QR Code

#### Nếu QR bị mờ/nhòe:
1. **Tăng độ phân giải**:
   - Chụp lại với camera tốt hơn
   - Hoặc dùng tool online [AI Image Upscaler](https://waifu2x.udp.jp/)

2. **Tăng độ tương phản**:
   - Dùng app ảnh: Tăng Contrast, giảm Brightness
   - Hoặc online: [Photopea](https://www.photopea.com/)

3. **Crop chính xác**:
   - Bao gồm margin trắng (quan trọng!)
   - Không cắt sát mép QR code
   - Giữ nguyên tỷ lệ vuông

#### Tools Online Miễn phí:
- **Tăng chất lượng**: [Upscale.media](https://upscale.media/)
- **Chỉnh sửa**: [Canva](https://canva.com/) 
- **Tạo QR mới**: [QR-Generator](https://www.qr-code-generator.com/)

### 🚀 Kiểm tra Chất lượng

#### Trước khi sử dụng:
1. **Zoom 300%** - Các ô vuông phải rõ ràng
2. **Test quét** - Dùng camera điện thoại thử
3. **Khoảng cách** - Quét được từ 20-30cm
4. **Ánh sáng** - Test trong điều kiện sáng/tối

#### Cấu trúc file cần có:
```
assets/
  images/
    qr-code.png  ← File này PHẢI có! (512x512px+)
    README.md
    qr-placeholder.js
```

### ⚡ Quick Fix nếu vẫn mờ:

1. **Mở hình gốc** trong Paint/Preview
2. **Resize** lên 1024x1024 pixels
3. **Save as PNG** (quality 100%)
4. **Copy vào** `assets/images/qr-code.png`

### 🔍 Technical Implementation

App sẽ hiển thị QR như sau:
```jsx
<Image 
  source={require('../../assets/images/qr-code.png')}
  style={{
    width: 250,      // Kích thước hiển thị
    height: 250,     
    resizeMode: 'contain'  // Giữ tỷ lệ, rõ nét
  }}
/>
```

### ⚠️ Lưu ý Bảo mật
- Không commit QR thật vào Git public
- QR demo cho development only
- Production cần QR riêng cho từng hóa đơn

---

**📞 Cần hỗ trợ?** Cung cấp hình QR gốc, tôi sẽ hướng dẫn cụ thể từng bước!

## Thông tin QR Code
- **Ngân hàng**: BIDV - CN SỞ GIAO DỊCH 2
- **Chủ tài khoản**: TRAN LE CHI BAO  
- **Số tài khoản**: 1304040403

## Ghi chú
- File phải có định dạng PNG
- Kích thước khuyến nghị: 512x512 pixels
- Nền trắng hoặc trong suốt

**⚠️ Nếu không có file này, app sẽ crash khi mở QR modal!**
