import dynamic from "next/dynamic";

const DynamicTranscribeCard = dynamic(
  () => import("../src/components/TranscribeCard"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

export default function Home() {
  return <DynamicTranscribeCard />;
}
