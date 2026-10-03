import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

const makeBlockId = () => globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(36).slice(2)}`

export default function NotesPage() {
  const { workspace, actions } = useWorkspace()
  const [selectedId, setSelectedId] = useState(workspace.notes[0]?.id || '')
  const note = workspace.notes.find(item => item.id === selectedId) || workspace.notes[0]
  function updateBlock(id, patch) { actions.updateNote(note.id, { blocks: note.blocks.map(block => block.id === id ? { ...block, ...patch } : block) }) }
  function addBlock(type) { actions.updateNote(note.id, { blocks: [...note.blocks, { id: makeBlockId(), type, text: '', checked: false }] }) }
  function removeBlock(id) { actions.updateNote(note.id, { blocks: note.blocks.filter(block => block.id !== id) }) }
  function moveBlock(index, direction) {
    const target = index + direction
    if (target < 0 || target >= note.blocks.length) return
    const blocks = [...note.blocks]
    ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
    actions.updateNote(note.id, { blocks })
  }
  function newNote() { setSelectedId(actions.addNote()) }

  return <div className="module-page notes-page"><div className="module-heading"><div><span className="eyebrow">A PLACE FOR YOUR THINKING</span><h1>Notes</h1><p>Build pages from simple blocks and connect them to courses.</p></div><button className="primary-button" onClick={newNote}><Icon name="plus" size={15} /> New page</button></div><div className="notes-layout"><aside className="notes-list"><h2>Your pages <span>{workspace.notes.length}</span></h2>{workspace.notes.map(item => <button key={item.id} className={`note-list-item ${item.id === note?.id ? 'active' : ''}`} onClick={() => setSelectedId(item.id)}><Icon name="document" size={15} /><span><strong>{item.title || 'Untitled'}</strong><small>{item.updatedAt}</small></span></button>)}</aside><div className="note-editor">{note ? <><div className="note-editor-top"><span className="eyebrow">PAGE</span><button className="plain-icon" aria-label="Delete note" onClick={() => { actions.deleteNote(note.id); setSelectedId('') }}><Icon name="trash" size={16} /></button></div><input className="note-title" aria-label="Note title" value={note.title} onChange={e => actions.updateNote(note.id, { title: e.target.value })} placeholder="Untitled" /><div className="note-properties"><label>Course <select value={note.courseId || ''} onChange={e => actions.updateNote(note.id, { courseId: e.target.value })}><option value="">No linked course</option>{workspace.courses.map(course => <option key={course.id} value={course.id}>{course.code} · {course.name}</option>)}</select></label><span>Edited {note.updatedAt}</span></div><div className="note-blocks">{note.blocks.map((block, index) => <div className={`note-block ${block.type}`} key={block.id}><div className="block-controls"><select aria-label={`Block type ${index + 1}`} value={block.type} onChange={e => updateBlock(block.id, { type: e.target.value })}><option value="text">Text</option><option value="heading">Heading</option><option value="todo">To do</option></select><button className="plain-icon" aria-label={`Move block ${index + 1} up`} disabled={index === 0} onClick={() => moveBlock(index, -1)}>↑</button><button className="plain-icon" aria-label={`Move block ${index + 1} down`} disabled={index === note.blocks.length - 1} onClick={() => moveBlock(index, 1)}>↓</button><button className="plain-icon" aria-label={`Delete block ${index + 1}`} onClick={() => removeBlock(block.id)}><Icon name="close" size={13} /></button></div>{block.type === 'todo' && <input type="checkbox" aria-label={`Complete block ${index + 1}`} checked={!!block.checked} onChange={e => updateBlock(block.id, { checked: e.target.checked })} />}{block.type === 'heading' ? <input className="block-heading-input" aria-label={`Heading block ${index + 1}`} value={block.text} onChange={e => updateBlock(block.id, { text: e.target.value })} placeholder="Heading" /> : <textarea aria-label={`${block.type === 'todo' ? 'To do' : 'Text'} block ${index + 1}`} rows={block.type === 'todo' ? 1 : 3} value={block.text} onChange={e => updateBlock(block.id, { text: e.target.value })} placeholder={block.type === 'todo' ? 'To do item' : 'Write anything...'} />}</div>)}</div><div className="add-blocks"><button onClick={() => addBlock('text')}>+ Text</button><button onClick={() => addBlock('heading')}>+ Heading</button><button onClick={() => addBlock('todo')}>+ To do</button></div></> : <div className="empty-note"><Icon name="note" size={26} /><h2>No pages yet</h2><p>Create a page to start writing.</p></div>}</div></div></div>
}
