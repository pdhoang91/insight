package storage

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"io"

	_ "image/gif"  // register GIF decoder
	_ "image/png"  // register PNG decoder
	_ "image/jpeg" // register JPEG decoder

	"golang.org/x/image/draw"
	_ "golang.org/x/image/webp" // register WebP decoder
)

// ImageVariant holds a resized image variant ready for upload.
type ImageVariant struct {
	Suffix      string    // e.g. "_thumb", "_800"
	Width       int       // target width (height scaled proportionally)
	Reader      io.Reader // encoded image bytes
	Size        int64
	ContentType string
}

// GenerateVariants decodes the image from src and produces resized variants.
// Only raster formats (JPEG, PNG, GIF, WebP) are processed; SVG/HEIC are skipped.
// Returns nil if the format is not supported or the original is smaller than the target.
func GenerateVariants(src io.Reader, contentType string) ([]*ImageVariant, error) {
	switch contentType {
	case "image/jpeg", "image/png", "image/gif", "image/webp":
		// supported
	default:
		return nil, nil // skip SVG, HEIC, BMP, TIFF, AVIF, etc.
	}

	data, err := io.ReadAll(src)
	if err != nil {
		return nil, err
	}

	img, _, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, err
	}

	origW := img.Bounds().Dx()

	targets := []struct {
		suffix string
		width  int
	}{
		{"_thumb", 400},
		{"_800", 800},
	}

	encode := buildEncoder(contentType)

	var variants []*ImageVariant
	for _, t := range targets {
		if origW <= t.width {
			continue // skip if original is already smaller
		}
		resized := resizeWidth(img, t.width)
		var buf bytes.Buffer
		if err := encode(&buf, resized); err != nil {
			continue
		}
		variants = append(variants, &ImageVariant{
			Suffix:      t.suffix,
			Width:       t.width,
			Reader:      bytes.NewReader(buf.Bytes()),
			Size:        int64(buf.Len()),
			ContentType: contentType,
		})
	}
	return variants, nil
}

// resizeWidth scales img so its width equals targetW, preserving aspect ratio.
func resizeWidth(src image.Image, targetW int) image.Image {
	bounds := src.Bounds()
	origW := bounds.Dx()
	origH := bounds.Dy()
	targetH := (origH * targetW) / origW

	dst := image.NewRGBA(image.Rect(0, 0, targetW, targetH))
	draw.BiLinear.Scale(dst, dst.Bounds(), src, bounds, draw.Over, nil)
	return dst
}

// buildEncoder returns an encode function matching the source content type.
func buildEncoder(contentType string) func(w io.Writer, img image.Image) error {
	if contentType == "image/png" {
		return func(w io.Writer, img image.Image) error {
			return png.Encode(w, img)
		}
	}
	// Default: JPEG with good quality
	return func(w io.Writer, img image.Image) error {
		return jpeg.Encode(w, img, &jpeg.Options{Quality: 85})
	}
}
