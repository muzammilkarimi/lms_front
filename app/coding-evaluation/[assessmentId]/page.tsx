import { CodingAssessmentClient } from "./CodingAssessmentClient";

type CodingAssessmentPageProps = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export default async function CodingAssessmentPage({ params }: CodingAssessmentPageProps) {
  const { assessmentId } = await params;

  return <CodingAssessmentClient assessmentId={assessmentId} />;
}
