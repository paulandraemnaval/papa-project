import { Table } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "./data-table";
import { columns } from "./obligation-vs-disbursement-columns";

const link =
  "https://docs.google.com/spreadsheets/d/1YDhJ46CGPpo6W6hTJtCgzlaIT3gtU9k6X4fLYoHm48Y/edit?pli=1&gid=508698332#gid=508698332";

async function getRecordVSObligtionData() {
  try {
    const request = await fetch("/api/obligation-vs-disbursement");

    const response = await request.json();

    console.log(response);

    if (response?.data === null) {
      return [];
    }

    return response.data;
  } catch (error: any) {
    return [];
  }
}

export default function ObligationVSDisbursement() {
  const { data, isLoading } = useQuery({
    queryKey: ["obligation-vs-disbursement"],
    queryFn: getRecordVSObligtionData,
    refetchOnWindowFocus: false,
  });

  if (!isLoading && data === null) {
    toast.error("An error occured. Please refresh and try again");
  }

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      loading={isLoading}
      link={link}
    ></DataTable>
  );
}
