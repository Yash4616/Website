import { RouteMarker } from "@/components/RouteMarker";
import { Brief } from "@/views/brief/Brief";

export default function Page() {
  return (
    <>
      <RouteMarker slug={null} />
      <Brief />
    </>
  );
}
