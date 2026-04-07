// components/manager/ParticipationTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ParticipationTable({ data }: { data: any[] }) {
  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead className="font-bold">Aluno / Departamento</TableHead>
          <TableHead className="text-center">Dias Presentes</TableHead>
          <TableHead className="text-center">Dias Ausentes</TableHead>
          <TableHead>Progresso do Treinamento</TableHead>
          <TableHead className="text-right">Desempenho</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((student) => (
          <TableRow key={student.id} className="hover:bg-slate-50/50 transition-colors">
            <TableCell>
              <div className="font-semibold text-slate-900">{student.name}</div>
              <div className="text-xs text-slate-500 uppercase">{student.department || 'Geral'}</div>
            </TableCell>
            <TableCell className="text-center font-medium text-green-600">
              {student.days_present}d
            </TableCell>
            <TableCell className="text-center font-medium text-red-500">
              {student.days_absent}d
            </TableCell>
            <TableCell className="w-[250px]">
              <div className="flex items-center gap-3">
                <Progress value={student.presenceRate} className="h-1.5" />
                <span className="text-xs font-bold text-slate-700">{student.presenceRate}%</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Badge 
                variant={student.status === "Alta Performance" ? "default" : "secondary"}
                className={student.status === "Alerta" ? "bg-red-100 text-red-700" : ""}
              >
                {student.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}