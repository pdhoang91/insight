import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageBlockView from './ImageBlockView'

const ImageBlock = Node.create({
  name: 'imageBlock',
  group: 'block',
  draggable: true,
  atom: false,

  addAttributes () {
    return {
      src: { default: null },
      alt: { default: '' },
      title: { default: '' },
      caption: { default: '' },
      alignment: { default: 'center' },
      width: { default: '100%' },
      dataImageId: { default: null },
    }
  },

  parseHTML () {
    return [
      {
        tag: 'figure[data-type="imageBlock"]',
        getAttrs: (dom) => ({
          src: dom.querySelector('img')?.getAttribute('src'),
          alt: dom.querySelector('img')?.getAttribute('alt'),
          caption: dom.querySelector('figcaption')?.textContent || '',
          alignment: dom.getAttribute('data-alignment') || 'center',
          width: dom.querySelector('img')?.style?.width || '100%',
        }),
      },
    ]
  },

  renderHTML ({ HTMLAttributes }) {
    const { src, alt, caption, alignment, width, dataImageId, ...rest } = HTMLAttributes
    return [
      'figure',
      mergeAttributes(rest, {
        'data-type': 'imageBlock',
        'data-alignment': alignment,
        class: `image-block image-block-${alignment}`,
      }),
      [
        'img',
        {
          src,
          alt,
          style: `width: ${width}`,
          ...(dataImageId ? { 'data-image-id': dataImageId } : {}),
        },
      ],
      caption ? ['figcaption', {}, caption] : ['figcaption', {}, ''],
    ]
  },

  addNodeView () {
    return ReactNodeViewRenderer(ImageBlockView)
  },

  addCommands () {
    return {
      setImageBlock: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        })
      },
    }
  },
})

export default ImageBlock
