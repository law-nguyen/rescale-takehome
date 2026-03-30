import type { ModalProps } from "../types";
import './styles/modal.css'

export default function Modal({ title, message, buttons, onClose }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-body">{message}</p>
        <div className="modal-actions">
          {buttons.map(btn => (
            <button
              key={btn.label}
              className={`btn-${btn.variant}`}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}