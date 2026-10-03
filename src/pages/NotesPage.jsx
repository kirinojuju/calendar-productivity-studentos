import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

const makeBlockId = () => globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(36).slice(2)}`
const today = () => new Date().toISOString().slice(0, 10)

function resizeTextArea(element) {
  if (!element || element.tagName !== 'TEXTAREA') return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

export default function NotesPage() {
  const { workspace, actions } = useWorkspace()
  const [selectedId, setSelectedId] = useState(workspace.notes[0]?.id || '')
  const note = workspace.notes.find(item => item.id === selectedId) || workspace.notes[0]
  const blockInputs = useRef(new Map())
  const pendingFocus = useRef(null)

  useEffect(() => {
    if (!note) return
    let changed = false
    const blocks = note.blocks.flatMap(block => {
      if (block.type !== 'todo' || !/[\r\n]/.test(block.text)) return [block]
      changed = true
      return block.text.split(/\r?\n/).map((text, index) => index === 0
        ? { ...block, text }
        : { id: makeBlockId(), type: 'todo', text, checked: false, indent: block.indent || 0 })
    })
    if (changed) actions.updateNote(note.id, { blocks })
  }, [note?.blocks, note?.id])

  useLayoutEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    const element = blockInputs.current.get(target.id)
    if (!element) return
    pendingFocus.current = null
    element.focus()
    const position = target.position === 'end' ? element.value.length : target.position || 0
    element.setSelectionRange(position, position)
  }, [note?.blocks, note?.id])

  function setBlockInput(id, element) {
    if (element) {
      blockInputs.current.set(id, element)
      resizeTextArea(element)
    } else blockInputs.current.delete(id)
  }

  function updateBlock(id, patch) {
    actions.updateNoteBlocks(note.id, blocks => blocks.map(block => block.id === id ? { ...block, ...patch } : block))
  }

  function addBlock(type) {
    const id = makeBlockId()
    pendingFocus.current = { id, position: 0 }
    actions.updateNoteBlocks(note.id, blocks => [...blocks, { id, type, text: '', checked: false, indent: 0 }])
  }

  function removeBlock(id, focusId) {
    if (focusId) pendingFocus.current = { id: focusId, position: 'end' }
    actions.updateNoteBlocks(note.id, blocks => blocks.filter(block => block.id !== id))
  }

  function moveBlock(index, direction) {
    actions.updateNoteBlocks(note.id, blocks => {
      const target = index + direction
      if (target < 0 || target >= blocks.length) return blocks
      const reordered = [...blocks]
        ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
      return reordered
    })
  }

  function handleBlockKeyDown(event, block, index) {
    if (event.isComposing) return

    if (event.key === 'Tab') {
      event.preventDefault()
      updateBlock(block.id, { indent: Math.max(0, Math.min(4, (Number(block.indent) || 0) + (event.shiftKey ? -1 : 1))) })
      return
    }

    if (event.key === 'Enter' && (block.type !== 'text' || !event.shiftKey)) {
      event.preventDefault()
      const value = event.currentTarget.value
      if (block.type === 'todo' && !value.trim()) {
        updateBlock(block.id, { type: 'text', text: '', checked: false, indent: 0 })
        pendingFocus.current = { id: block.id, position: 0 }
        return
      }
      const before = value.slice(0, event.currentTarget.selectionStart)
      const after = value.slice(event.currentTarget.selectionEnd)
      const id = makeBlockId()
      const type = block.type === 'heading' ? 'text' : block.type
      pendingFocus.current = { id, position: 0 }
      actions.updateNoteBlocks(note.id, blocks => {
        const position = blocks.findIndex(item => item.id === block.id)
        if (position < 0) return blocks
        return [
          ...blocks.slice(0, position),
          { ...blocks[position], text: before },
          { id, type, text: after, checked: false, indent: block.indent || 0 },
          ...blocks.slice(position + 1),
        ]
      })
      return
    }

    if (event.key === 'Backspace' && event.currentTarget.value === '' && event.currentTarget.selectionStart === 0 && index > 0) {
      event.preventDefault()
      removeBlock(block.id, note.blocks[index - 1].id)
    }
  }

  function newNote() { setSelectedId(actions.addNote()) }

  return <div className="module-page notes-page">
    <div className="module-heading">
      <div><span className="eyebrow">A PLACE FOR YOUR THINKING</span><h1>Notes</h1><p>Build pages from simple blocks and connect them to courses.</p></div>
      <button className="primary-button" onClick={newNote}><Icon name="plus" size={15} /> New page</button>
    </div>
    <div className="notes-layout">
      <aside className="notes-list">
        <h2>Your pages <span>{workspace.notes.length}</span></h2>
        {workspace.notes.map(item => <button key={item.id} className={`note-list-item ${item.id === note?.id ? 'active' : ''}`} onClick={() => setSelectedId(item.id)}>
          <Icon name="document" size={15} /><span><strong>{item.title || 'Untitled'}</strong><small>{item.updatedAt}</small></span>
        </button>)}
      </aside>
      <div className="note-editor">{note ? <>
        <div className="note-editor-top"><span className="eyebrow">PAGE</span><button className="plain-icon" aria-label="Delete note" onClick={() => { actions.deleteNote(note.id); setSelectedId('') }}><Icon name="trash" size={16} /></button></div>
        <input className="note-title" aria-label="Note title" value={note.title} onChange={event => actions.updateNote(note.id, { title: event.target.value })} placeholder="Untitled" />
        <div className="note-properties"><label>Course <select value={note.courseId || ''} onChange={event => actions.updateNote(note.id, { courseId: event.target.value })}><option value="">No linked course</option>{workspace.courses.map(course => <option key={course.id} value={course.id}>{course.code} · {course.name}</option>)}</select></label><span>Edited {note.updatedAt || today()}</span></div>
        <div className="note-blocks">{note.blocks.map((block, index) => <div className={`note-block ${block.type} ${block.indent ? 'is-indented' : ''}`} style={{ '--block-indent': `${Math.max(0, Math.min(4, Number(block.indent) || 0)) * 24}px` }} key={block.id}>
          <div className="block-controls">
            <select aria-label={`Block type ${index + 1}`} value={block.type} onChange={event => updateBlock(block.id, { type: event.target.value, checked: false })}><option value="text">Text</option><option value="heading">Heading</option><option value="todo">To do</option></select>
            <button className="plain-icon" aria-label={`Move block ${index + 1} up`} disabled={index === 0} onClick={() => moveBlock(index, -1)}>↑</button>
            <button className="plain-icon" aria-label={`Move block ${index + 1} down`} disabled={index === note.blocks.length - 1} onClick={() => moveBlock(index, 1)}>↓</button>
            <button className="plain-icon" aria-label={`Delete block ${index + 1}`} onClick={() => removeBlock(block.id)}><Icon name="close" size={13} /></button>
          </div>
          {block.type === 'todo' && <input type="checkbox" aria-label={`Complete block ${index + 1}`} checked={!!block.checked} onChange={event => updateBlock(block.id, { checked: event.target.checked })} />}
          {block.type === 'text'
            ? <textarea ref={element => setBlockInput(block.id, element)} className="block-text-input" aria-label={`Text block ${index + 1}`} rows={1} value={block.text} onChange={event => updateBlock(block.id, { text: event.target.value })} onInput={event => resizeTextArea(event.currentTarget)} onKeyDown={event => handleBlockKeyDown(event, block, index)} placeholder="Write anything..." />
            : <input ref={element => setBlockInput(block.id, element)} className={block.type === 'heading' ? 'block-heading-input' : 'block-todo-input'} aria-label={`${block.type === 'todo' ? 'To do' : 'Heading'} block ${index + 1}`} value={block.text} onChange={event => updateBlock(block.id, { text: event.target.value })} onKeyDown={event => handleBlockKeyDown(event, block, index)} placeholder={block.type === 'todo' ? 'To do item' : 'Heading'} />}
        </div>)}</div>
        <div className="add-blocks"><button onClick={() => addBlock('text')}>+ Text</button><button onClick={() => addBlock('heading')}>+ Heading</button><button onClick={() => addBlock('todo')}>+ To do</button></div>
        <p className="note-shortcuts">Enter adds a block · Tab indents · Shift+Tab moves out · Shift+Enter adds a line within text</p>
      </> : <div className="empty-note"><Icon name="note" size={26} /><h2>No pages yet</h2><p>Create a page to start writing.</p></div>}</div>
    </div>
  </div>
}
