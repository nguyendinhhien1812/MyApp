// Ghép 2 ảnh chụp màn hình cạnh nhau để đối chiếu sáng/tối trong một hình.
//
//   swift tools/SideBySide.swift trai.png phai.png ket-qua.png

import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 4 else {
    fatalError("cần: <trái.png> <phải.png> <ra.png>")
}

func load(_ path: String) -> CGImage {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
        fatalError("không đọc được \(path)")
    }
    return img
}

let left = load(args[1]), right = load(args[2])
let gap = 24
let w = left.width + right.width + gap
let h = max(left.height, right.height)

guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                          space: CGColorSpace(name: CGColorSpace.sRGB)!,
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    fatalError("không tạo được context")
}
// Nền xám trung tính để cả ảnh sáng lẫn ảnh tối đều tách khỏi khe giữa
ctx.setFillColor(CGColor(srgbRed: 0.45, green: 0.45, blue: 0.45, alpha: 1))
ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
ctx.draw(left, in: CGRect(x: 0, y: h - left.height, width: left.width, height: left.height))
ctx.draw(right, in: CGRect(x: left.width + gap, y: h - right.height,
                           width: right.width, height: right.height))

guard let out = ctx.makeImage(),
      let dest = CGImageDestinationCreateWithURL(
        URL(fileURLWithPath: args[3]) as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fatalError("không ghi được \(args[3])")
}
CGImageDestinationAddImage(dest, out, nil)
CGImageDestinationFinalize(dest)
print("đã ghép -> \(args[3])")
