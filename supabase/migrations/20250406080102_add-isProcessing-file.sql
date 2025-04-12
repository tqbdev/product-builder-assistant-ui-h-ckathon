alter table "public"."files" add column "isProcessing" boolean;

alter table "public"."files" enable row level security;



