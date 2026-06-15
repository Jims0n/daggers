'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateDealSettings } from "@/lib/actions/setting.action";
import { useState, useTransition } from "react";

interface DealSettingsFormProps {
    dealTitle: string;
    dealDescription: string;
    dealEndDate: string;
    dealEnabled: boolean;
}

const DealSettingsForm = ({
    dealTitle: initialTitle,
    dealDescription: initialDescription,
    dealEndDate: initialEndDate,
    dealEnabled: initialEnabled,
}: DealSettingsFormProps) => {
    const [dealTitle, setDealTitle] = useState(initialTitle);
    const [dealDescription, setDealDescription] = useState(initialDescription);
    const [dealEndDate, setDealEndDate] = useState(initialEndDate);
    const [dealEnabled, setDealEnabled] = useState(initialEnabled);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await updateDealSettings({
                dealTitle,
                dealDescription,
                dealEndDate,
                dealEnabled,
            });
            toast({
                variant: result.success ? "default" : "destructive",
                description: result.message,
            });
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Deal Countdown Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            id="dealEnabled"
                            checked={dealEnabled}
                            onChange={(e) => setDealEnabled(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="dealEnabled">Enable deal countdown on homepage</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dealTitle">Deal Title</Label>
                        <Input
                            id="dealTitle"
                            value={dealTitle}
                            onChange={(e) => setDealTitle(e.target.value)}
                            placeholder="Deal of the month"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dealDescription">Deal Description</Label>
                        <Textarea
                            id="dealDescription"
                            value={dealDescription}
                            onChange={(e) => setDealDescription(e.target.value)}
                            placeholder="Describe the deal..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dealEndDate">End Date & Time</Label>
                        <Input
                            id="dealEndDate"
                            type="datetime-local"
                            value={dealEndDate}
                            onChange={(e) => setDealEndDate(e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                        {isPending ? "Saving..." : "Save Settings"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default DealSettingsForm;
