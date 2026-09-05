// Sinh ảnh dấu nhận diện cho splash Android: ba thanh, nền trong suốt.
//
//   swift tools/RenderAndroidSplash.swift
//
// Vì sao nền TRONG SUỐT (khác icon iOS phải đặc): Android tự tô nền bằng
// windowSplashScreenBackground rồi vẽ ảnh này đè lên, nên ảnh phải có alpha.
//
// Hai biến thể sáng/tối vì Android 12 không đổi màu ảnh theo theme — phải cấp
// hai file và cho values-night chọn file tối.
//
// Android 12 cắt ảnh splash thành hình TRÒN và chỉ chừa 2/3 đường kính cho nội
// dung. Bố cục dưới đây đã tính lề đó; vẽ tràn ra là bị cắt cụt.

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let repoRoot = URL(fileURLWithPath: CommandLine.arguments[0])
    .deletingLastPathComponent().deletingLastPathComponent()
let resDir = repoRoot.appendingPathComponent("android/app/src/main/res").path

func rgb(_ hex: UInt32) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
}

// Trùng SplashPlate*.colorset của iOS
struct Palette { let p1, p2, p3: UInt32 }
let light = Palette(p1: 0xF0C48A, p2: 0xC98F3A, p3: 0x8A5E1C)
let dark  = Palette(p1: 0x6B4F22, p2: 0x96682C, p3: 0xD8B783)

// Ảnh vuông; nội dung nằm gọn trong 2/3 giữa để không bị mặt nạ tròn cắt
let SAFE: CGFloat = 0.62
let BAR_H: CGFloat = 0.165          // theo cạnh vùng an toàn
let BAR_GAP: CGFloat = 0.105
let BAR_WIDTHS: [CGFloat] = [1.00, 0.87, 0.74]

func render(_ pal: Palette, size: Int, to path: String) {
    guard let ctx = CGContext(data: nil, width: size, height: size,
                              bitsPerComponent: 8, bytesPerRow: 0,
                              space: CGColorSpace(name: CGColorSpace.sRGB)!,
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        fatalError("không tạo được bitmap \(size)px")
    }
    ctx.setAllowsAntialiasing(true)

    let s = CGFloat(size)
    let safe = s * SAFE
    let barH = BAR_H * safe
    let gap = BAR_GAP * safe
    let blockH = barH * 3 + gap * 2
    var top = (s - blockH) / 2

    for (i, color) in [pal.p3, pal.p2, pal.p1].enumerated() {
        let w = BAR_WIDTHS[i] * safe
        let rect = CGRect(x: (s - w) / 2, y: s - top - barH, width: w, height: barH)
        ctx.setFillColor(rgb(color))
        ctx.addPath(CGPath(roundedRect: rect, cornerWidth: barH / 2,
                           cornerHeight: barH / 2, transform: nil))
        ctx.fillPath()
        top += barH + gap
    }

    guard let image = ctx.makeImage(),
          let dest = CGImageDestinationCreateWithURL(
            URL(fileURLWithPath: path) as CFURL, UTType.png.identifier as CFString, 1, nil)
    else { fatalError("không ghi được \(path)") }
    CGImageDestinationAddImage(dest, image, nil)
    guard CGImageDestinationFinalize(dest) else { fatalError("không lưu được \(path)") }
}

// Android 12 đòi ảnh splash 288dp (icon 108dp trong khung 288dp là chuẩn adaptive)
let densities: [(dir: String, px: Int)] = [
    ("drawable-mdpi", 288), ("drawable-hdpi", 432), ("drawable-xhdpi", 576),
    ("drawable-xxhdpi", 864), ("drawable-xxxhdpi", 1152),
]

for d in densities {
    let dir = "\(resDir)/\(d.dir)"
    try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
    render(light, size: d.px, to: "\(dir)/splash_mark.png")
    render(dark,  size: d.px, to: "\(dir)/splash_mark_dark.png")
}
print("đã sinh splash_mark (sáng + tối) cho \(densities.count) mật độ")
