import { useState } from "react";
import styles from "./TaskModal.module.css";

export default function TaskModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [subtasks, setSubtasks] = useState([""]);

  const handleAddSubtask = () => setSubtasks([...subtasks, ""]);

  const handleSubtaskChange = (index, value) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const task = {
      id: `TASK-${Date.now()}`,
      title: title.trim(),
      status: "pending",
      subtasks: subtasks
        .filter((s) => s.trim())
        .map((s, i) => ({
          id: `TASK-${Date.now()}-${i}`,
          title: s.trim(),
          status: "pending",
        })),
    };

    onSave(task);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nova task</h2>
          <button className={styles.btnClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Título</label>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex: Implementar autenticação"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Subtasks</label>
          <div className={styles.subtaskList}>
            {subtasks.map((sub, i) => (
              <div key={i} className={styles.subtaskRow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={`Subtask ${i + 1}`}
                  value={sub}
                  onChange={(e) => handleSubtaskChange(i, e.target.value)}
                />
                <button
                  className={styles.btnRemove}
                  onClick={() => handleRemoveSubtask(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button className={styles.btnAddSubtask} onClick={handleAddSubtask}>
            + Adicionar subtask
          </button>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnSave}
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Criar task
          </button>
        </div>
      </div>
    </div>
  );
}
