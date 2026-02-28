import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface HumanFeedbackDialogProps {
    isOpen: boolean
    action: "approved" | "rejected" | null
    onClose: () => void
    onSubmit: (feedback: { reason: string, notes: string }) => void
    isSubmitting: boolean
}

export function HumanFeedbackDialog({ isOpen, action, onClose, onSubmit, isSubmitting }: HumanFeedbackDialogProps) {
    const [reason, setReason] = useState("inaccurate_data")
    const [notes, setNotes] = useState("")

    if (!action) return null

    const handleSubmit = () => {
        onSubmit({ reason, notes })
        setNotes("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {action === "approved" ? "Approve Decision" : "Reject Decision"}
                    </DialogTitle>
                    <DialogDescription>
                        Please provide feedback to help train and improve the AI models.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {action === "rejected" && (
                        <div className="space-y-3">
                            <Label>Primary Reason for Rejection</Label>
                            <RadioGroup value={reason} onValueChange={setReason} className="grid gap-2">
                                <div>
                                    <RadioGroupItem value="inaccurate_data" id="inaccurate_data" className="peer sr-only" />
                                    <Label htmlFor="inaccurate_data" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors cursor-pointer">
                                        Inaccurate Data
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="bias_detected" id="bias_detected" className="peer sr-only" />
                                    <Label htmlFor="bias_detected" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors cursor-pointer">
                                        Bias Detected
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="better_alternative" id="better_alternative" className="peer sr-only" />
                                    <Label htmlFor="better_alternative" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors cursor-pointer">
                                        Better Alternative Route
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="other" id="other" className="peer sr-only" />
                                    <Label htmlFor="other" className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-colors cursor-pointer">
                                        Other
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Additional Notes (Optional)</Label>
                        <Textarea
                            placeholder="Add any specific context for the ML team..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
