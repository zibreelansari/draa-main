import { Modal, Descriptions, Tag, Divider, Card } from"antd";
import dayjs from"dayjs";
import { Exam } from"./exam";

interface Props {
  exam: Exam | null;
  open: boolean;
  onClose: () => void;
}

const ViewExamModal: React.FC<Props> = ({ exam, open, onClose }) => {
  if (!exam) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title={`View Exam  ${exam.name}`}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Exam Name">{exam.name}</Descriptions.Item>
        <Descriptions.Item label="Slug">{exam.slug}</Descriptions.Item>

        <Descriptions.Item label="Category">
          {typeof exam.categoryId ==="object"
            ? exam.categoryId.name
            :""}
        </Descriptions.Item>

        <Descriptions.Item label="Level">
          <Tag>{exam.examLevel ||""}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Mode">
          <Tag color="purple">{exam.mode ||""}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={exam.status ==="ACTIVE" ?"green" :"red"}>
            {exam.status}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Notification">
          {exam.importantDates?.notificationDate
            ? dayjs(exam.importantDates.notificationDate).format("DD MMM YYYY")
            :""}
        </Descriptions.Item>
        <Descriptions.Item label="Exam Date">
          {exam.importantDates?.examDate
            ? dayjs(exam.importantDates.examDate).format("DD MMM YYYY")
            :""}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Eligibility">
          Age: {exam.eligibility?.ageMin ??""} {""}
          {exam.eligibility?.ageMax ??""} <br />
          Education: {exam.eligibility?.education ||""}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <h4>Phases</h4>
      {exam.phases?.length ? (
        exam.phases.map((p, i) => (
          <Card key={i} size="small" style={{ marginBottom: 12 }}>
            <strong>{p.name}</strong>
            <Divider />
            {p.sections?.map((s, j) => (
              <p key={j}>
                {s.name}  {s.questions} Qs  {s.marks} Marks
              </p>
            ))}
          </Card>
        ))
      ) : (
        <p></p>
      )}

      <Divider />

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="SEO Title">
          {exam.seo?.seo_title ||""}
        </Descriptions.Item>
        <Descriptions.Item label="Meta Description">
          {exam.seo?.meta_description ||""}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left"> Mapped Resources</Divider>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
        {exam.mappedResources?.syllabus?.length ? <Tag color="blue">{exam.mappedResources.syllabus.length} Syllabus</Tag> : null}
        {exam.mappedResources?.pyqs?.length ? <Tag color="cyan">{exam.mappedResources.pyqs.length} PYQs</Tag> : null}
        {exam.mappedResources?.notifications?.length ? <Tag color="orange">{exam.mappedResources.notifications.length} Notifications</Tag> : null}
        {exam.mappedResources?.currentAffairs?.length ? <Tag color="purple">{exam.mappedResources.currentAffairs.length} Current Affairs</Tag> : null}
        {!exam.mappedResources?.syllabus?.length && !exam.mappedResources?.pyqs?.length && 
         !exam.mappedResources?.notifications?.length && !exam.mappedResources?.currentAffairs?.length && (
          <p style={{ color:'#999' }}>No resources mapped yet.</p>
        )}
      </div>
    </Modal>
  );
};

export default ViewExamModal;
