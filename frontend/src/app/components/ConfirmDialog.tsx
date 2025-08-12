import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function ConfirmDialog({ title, description, onConfirm, confirmText = 'Poista', onCancel, isSaving }: { title: string, description: string, confirmText?: string, onConfirm: () => void, onCancel: () => void, isSaving: boolean }) {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className="hidden sm:block">Peruuta</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isSaving}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
