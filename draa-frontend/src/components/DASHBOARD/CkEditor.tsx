import { CKEditor } from'@ckeditor/ckeditor5-react'
import ClassicEditor from'@ckeditor/ckeditor5-build-classic'
import url from'../../url'


class UploadAdapter {
  constructor(loader) {
    this.loader = loader
  }

  async upload() {
    const file = await this.loader.file
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${url}/editor/upload`, {
      method:'POST',
      body: formData
    })

    const data = await res.json()
    return { default: data.location }
  }
}

function UploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return new UploadAdapter(loader)
  }
}


const CkEditor = ({ value, onChange }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}
      config={{
         extraPlugins: [UploadAdapterPlugin],
        toolbar: [
'heading',
'|',
'bold',
'italic',
'underline',
'link',
'|',
'bulletedList',
'numberedList',
'|',
'insertTable',
'imageUpload',
'blockQuote',
'|',
'undo',
'redo'
        ],
        table: {
          contentToolbar: ['tableColumn','tableRow','mergeTableCells']
        },
        image: {
          toolbar: ['imageTextAlternative','imageStyle:inline','imageStyle:block']
        }
      }}
      onChange={(event, editor) => {
        const data = editor.getData()
        onChange(data)
      }}
    />
  )
}

export default CkEditor
