import { exec } from "child_process";

if (process.platform !== "win32") {
  exec("chmod +x node_modules/.bin/vite", (err) => {
    if (err) {
      console.log("chmod falhou (ignorado)");
    } else {
      console.log("Permissões corrigidas");
    }
  });
} else {
  console.log("Windows detectado, ignorando chmod");
}