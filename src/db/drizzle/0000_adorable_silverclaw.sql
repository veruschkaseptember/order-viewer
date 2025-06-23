CREATE TYPE "public"."order_status" AS ENUM('Pending', 'Processing', 'Shipped', 'Cancelled');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"product_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"status" "order_status" NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"paid" boolean DEFAULT false,
	"currency" varchar(3) DEFAULT 'ZAR' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_total_idx" ON "orders" USING btree ("total");--> statement-breakpoint
CREATE INDEX "orders_paid_idx" ON "orders" USING btree ("paid");