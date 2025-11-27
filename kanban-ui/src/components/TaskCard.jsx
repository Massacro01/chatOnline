import PropTypes from 'prop-types';
import './TaskCard.css';

const TaskCard = ({ task, index, isDragging }) => {
    return (
        <div className={`task-card ${isDragging ? 'dragging' : ''}`}>
            <div className="task-card-header">
                <h4 className="task-title">{task.title}</h4>
            </div>

            {task.description && (
                <p className="task-description">{task.description}</p>
            )}

            <div className="task-card-footer">
                <span className="task-order">#{task.order}</span>
            </div>
        </div>
    );
};

TaskCard.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        order: PropTypes.number.isRequired,
        columnId: PropTypes.string.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool,
};

TaskCard.defaultProps = {
    isDragging: false,
};

export default TaskCard;
