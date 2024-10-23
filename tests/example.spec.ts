// import { test, expect } from '@playwright/test';
// import { getSession } from 'auth-astro/server';

// test('Verificar componentes de ingreso a la web', async ({ page }) => {
//   await page.goto('http://localhost:4321/');
//   await page.waitForLoadState('domcontentloaded');

//   const consideraciones = await page.locator('.consideraciones');
//   const session = await page.locator('.session_container');


//   expect(session).toBeDefined()
//   expect(consideraciones).toBeDefined()
//   expect(session.getByText('Ingresar')).toBeDefined();
//   expect(session.locator('.session_btn')).toBeDefined();
//   expect(consideraciones.getByRole('list')).toBeDefined()

// });

// test('Dar click en el boton de inicio de sesion', async ({ page }) => {
//   await page.goto('http://localhost:4321/');
//   await page.waitForLoadState('domcontentloaded');

//   const btnSessionGit = await page.getByRole('button').locator('.github')

//   expect(btnSessionGit).toBeDefined();

//   page.click('.github');

//   await page.waitForTimeout(1000)
//   // await page.goto('http://localhost:4321/chat');
//   // await page.waitForLoadState('domcontentloaded');

//   const chat = page.locator('.conatiner_chat');
//   const contenedorMensajes = page.locator('.container_messages');
//   expect(chat).toBeDefined()
//   expect(contenedorMensajes).toBeDefined()

//   const messages = await page.evaluate(() => {
//     return document.querySelectorAll('.container_messages .message p').length
//   })

//   console.log(messages)
// });