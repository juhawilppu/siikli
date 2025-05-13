import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ConfirmDialog({ title, description, onConfirm, onCancel }: { title: string, description: string, onConfirm: () => void, onCancel: () => void }) {
    return (
        <Dialog open={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Peruuta</Button>
                    <Button variant="destructive" onClick={onConfirm}>Poista</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}