'use client'

import { usePdfDocument } from '@/hooks/usePdfDocument'
import { useCvViewer } from '@/hooks/useCvViewer'
import { useCvKeys } from '@/hooks/useCvKeys'
import CvLoader from '@/components/cv/CvLoader'
import CvToolbar from '@/components/cv/CvToolbar'
import CvDocument from '@/components/cv/CvDocument'
import CvStatusBar from '@/components/cv/CvStatusBar'
import { CV_URL, parseViewerCommand } from '@/utils/cvViewer'

const shell = 'flex flex-col h-[calc(100vh-2.5rem)] bg-black text-white'

export default function CvViewer() {
  const pdf = usePdfDocument(CV_URL)
  const ready = pdf.status === 'ready'
  const viewer = useCvViewer(ready ? pdf.doc.numPages : 0, ready ? pdf.bytes : undefined)
  useCvKeys(viewer, ready)

  if (pdf.status === 'error') {
    return (
      <div className={`${shell} items-center justify-center font-mono px-4`}>
        <p className="text-red-500">cv.pdf: {pdf.message}</p>
        <a href={CV_URL} className="mt-2 text-terminal hover:underline">try the raw file</a>
      </div>
    )
  }

  if (pdf.status === 'loading') {
    return (
      <div className={shell}>
        <CvLoader loaded={pdf.loaded} total={pdf.total} parsing={pdf.parsing} />
      </div>
    )
  }

  return (
    <div className={shell}>
      <CvToolbar viewer={viewer} />
      <CvDocument viewer={viewer} doc={pdf.doc} bytes={pdf.bytes} text={pdf.text} />
      <CvStatusBar
        mode={viewer.mode}
        phosphor={viewer.phosphor}
        page={viewer.page}
        pages={viewer.pages}
        zoom={viewer.zoom}
        message={viewer.message}
        commandOpen={viewer.commandOpen}
        onCommand={(input) => { viewer.setCommandOpen(false); viewer.runAction(parseViewerCommand(input)) }}
        onCloseCommand={() => viewer.setCommandOpen(false)}
      />
    </div>
  )
}
