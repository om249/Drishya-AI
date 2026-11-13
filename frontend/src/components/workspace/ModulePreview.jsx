
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

function ModulePreview({ module, onAction }) {
  return (
    <div className="module-preview page-content">
      <div className="module-preview-top">
        <span className="section-kicker">
          {module.eyebrow}
        </span>

        <span className="module-status">
          <Sparkles size={13} />
          In development
        </span>
      </div>

      <div className="module-preview-content">
        <div className="module-preview-icon">
          <Sparkles size={30} />
        </div>

        <h1>{module.title}</h1>
        <p>{module.description}</p>

        <div className="module-feature-list">
          {module.features.map((feature) => (
            <div key={feature} className="module-feature">
              <CheckCircle2 size={18} />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {module.action && (
          <button
            className="primary-btn"
            onClick={onAction}
          >
            {module.action}
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      <div className="module-preview-footer">
        <Sparkles size={16} />
        <span>
          We're building this experience as part of the Drishya
          platform roadmap.
        </span>
      </div>
    </div>
  )
}

export default ModulePreview
