1. Una vez descargado el modelo se guarda de manera local en el navegador.
2. Utiliza la api WEBGpu lo que hace es usar toda la potencia grafica de la gpu en el navegador.
-navigator.gpu ----> Nos permite saber si el navegador del usuario es compatible con la api.
-navigator.gpu.requestAdapter().requestDevice()---->Nos permite saber la informacion de la gpu

3. Se pude usar sin interner siempre y cuando se haya descargado previamente el modelo.

--Llama es el mejor modelo
--phi intermedio
--gemma peor

4. Entre mas pesado el modelo la respuesta sera mejor.


////////
1. Ajustar el modal y agregarle funcionalidad ✅
2. Cambiar estilo de mensajes ✅
3. Migrar el guardado de mensajes al localStorage ✅
4. Refactorizar el codigo ✅
5. Test con playwrigth