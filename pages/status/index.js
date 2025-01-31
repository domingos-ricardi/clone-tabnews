//import { useState, useEffect } from "react";
import style from "../status/status.module.css";
//import CapsLock from "components/caps-lock";
import useSwr from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function Status() {
  /*const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/status")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;*/

  return (
    <div className={style.main}>
      <div className={style.title}>Tab Status</div>
      <UpdateAt />
    </div>
  );
}

function UpdateAt() {
  const { isLoading, data } = useSwr("/api/v1/status", fetchAPI, {
    //refreshInterval: 2000,
  });

  let updateAtText = "Carregando Informações...";
  let dbVersion;
  let maxConnections;
  let openedConnections;

  if (!isLoading && data) {
    console.log(data);
    updateAtText = new Date(data.update_at).toLocaleString("pt-BR");
    dbVersion = data.dependencies.database.version;
    maxConnections = data.dependencies.database.max_connections;
    openedConnections = data.dependencies.database.opened_connections;
  }

  return (
    <>
      <div>Última Atualização: {updateAtText} BR</div>
      <div>Database Version: {dbVersion}</div>
      <div>Max Connections: {maxConnections}</div>
      <div>Opened Connections: {openedConnections}</div>
    </>
  );
}
