import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAttendanceContext } from "@/context/AttendanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Students() {
  const { students, addStudent, editStudent, deleteStudent } = useAttendanceContext();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Sort students by ID number in ascending order
  const sortedStudents = [...students].sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ""), 10);
    const numB = parseInt(b.id.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  const handleAddStudent = () => {
    if (newStudentName.trim()) {
      addStudent(newStudentName);
      setNewStudentName("");
      setAddDialogOpen(false);
    }
  };

  const handleEditStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    if (student) {
      setEditingId(id);
      setEditingName(student.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      editStudent(editingId, editingName);
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteStudent(deleteTargetId);
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-mono font-bold tracking-widest text-primary uppercase">
          STUDENTS
        </h1>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="font-mono text-sm font-semibold"
        >
          + ADD STUDENT
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-sidebar">
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    No students yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border hover:bg-sidebar/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-primary">
                      {student.id}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="font-mono text-sm"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="font-mono text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            className="font-mono text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm">{student.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditStudent(student.id)}
                          className="h-8 w-8 p-0"
                          disabled={editingId !== null}
                          title="Edit student"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(student.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          disabled={editingId !== null}
                          title="Delete student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="font-mono">
          <DialogHeader>
            <DialogTitle className="font-mono font-bold uppercase tracking-widest">
              Add New Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter student name"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddStudent();
                }
              }}
              className="font-mono"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="font-mono text-sm font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStudent}
              className="font-mono text-sm font-semibold"
            >
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="font-mono">
          <AlertDialogTitle className="font-mono font-bold uppercase tracking-widest">
            Delete Student
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono">
            Are you sure you want to delete this student? This will also remove all their
            attendance records. This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel className="font-mono text-sm font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="font-mono text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
