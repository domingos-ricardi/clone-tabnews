import { useState, useEffect } from "react";
import style from "../status/status.module.css";

export default function Status() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/status")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className={style.main}>
      <div className={style.title}>Tab Status</div>
      <div>Última Atualização em: {data.update_at}</div>
      <div>
        Versão do banco de dados atual: {data.dependencies.database.version}
      </div>
      <div>Situação atual do sistema: OK</div>
    </div>
  );
}
