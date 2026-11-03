# CaribeGaming

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
## Desenvolvimento local

Consulte o [contexto técnico](docs/technical-context.md) antes de continuar a
migração ou delegar tarefas a outro agente.

Frontend:

```bash
npm install
npm run build
```

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run typecheck
npm run dev
```

O backend inicia em `APP_MODE=local` sem exigir serviços externos. Para
habilitar a integração, configure as credenciais no `.env` do backend e a URL
e a chave anon do Supabase em `src/environments/environment.ts`. Chaves de
serviço, pagamento e provedores externos devem permanecer exclusivamente no
backend.
