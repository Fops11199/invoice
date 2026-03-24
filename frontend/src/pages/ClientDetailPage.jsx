import { useParams } from "react-router-dom";

export default function ClientDetailPage() { const { id } = useParams(); return <div className="p-6"><h1 className="text-2xl font-bold">Client {id}</h1></div>; }
