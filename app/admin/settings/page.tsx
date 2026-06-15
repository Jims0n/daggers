import { Metadata } from "next";
import { auth } from "@/auth";
import { getDealSettings } from "@/lib/actions/setting.action";
import DealSettingsForm from "./deal-settings-form";

export const metadata: Metadata = {
    title: "Settings | Admin",
};

const AdminSettingsPage = async () => {
    const session = await auth();

    if (session?.user.role !== "admin") {
        throw new Error("User is not authorized");
    }

    const dealSettings = await getDealSettings();

    return (
        <div className="space-y-6">
            <h1 className="h2-bold">Settings</h1>
            <DealSettingsForm
                dealTitle={dealSettings?.dealTitle || "Deal of the month"}
                dealDescription={dealSettings?.dealDescription || ""}
                dealEndDate={dealSettings?.dealEndDate?.toISOString().slice(0, 16) || ""}
                dealEnabled={dealSettings?.dealEnabled ?? false}
            />
        </div>
    );
};

export default AdminSettingsPage;
