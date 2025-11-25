"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecordLogForm from "./components/record-log-form";
import ObligationsForm from "./components/obligations-form";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import DisbursementForm from "./components/disbursements-form";
import RecordVSObligation from "./components/record-vs-obligation";
import ObligationVSDisbursement from "./components/obligation-vs-disbursement";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex w-[70dvw] flex-col gap-6 items-center">
        <Tabs defaultValue="record-log" className="gap-6 max-w-full">
          <TabsList className="self-center">
            <TabsTrigger value="record-log">Record Log</TabsTrigger>
            <TabsTrigger value="obligations">Obligations</TabsTrigger>
            <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
            <TabsTrigger value="record-vs-obligation">
              Record vs Obligation
            </TabsTrigger>
            <TabsTrigger value="obligation-vs-disbursement">
              Obligation vs Disbursement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record-log" className="w-xl self-center">
            <RecordLogForm />
          </TabsContent>
          <TabsContent value="obligations" className="w-xl self-center">
            <ObligationsForm />
          </TabsContent>
          <TabsContent value="disbursements" className="w-xl self-center">
            <DisbursementForm />
          </TabsContent>
          <TabsContent
            value="record-vs-obligation"
            className=" w-full self-center"
          >
            <RecordVSObligation />
          </TabsContent>
          <TabsContent
            value="obligation-vs-disbursement"
            className="w-full self-center"
          >
            <ObligationVSDisbursement />
          </TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}
