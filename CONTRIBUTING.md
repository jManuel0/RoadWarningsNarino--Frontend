# Guía de Contribución

¡Gracias por tu interés en contribuir a Road Warnings Frontend! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Puedo Contribuir](#cómo-puedo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Commits y Pull Requests](#commits-y-pull-requests)
- [Reporte de Bugs](#reporte-de-bugs)
- [Solicitud de Features](#solicitud-de-features)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor, reporta comportamientos inaceptables.

### Nuestros Estándares

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con diferentes puntos de vista
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

## 🤝 Cómo Puedo Contribuir

### Reportar Bugs

Antes de crear un reporte de bug:

- Verifica que no exista un issue similar
- Determina en qué parte del código está el problema
- Recopila información sobre el bug

Cuando crees un bug report, incluye:

- **Título descriptivo**
- **Pasos para reproducir** el bug
- **Comportamiento esperado** vs **comportamiento actual**
- **Screenshots** si es posible
- **Información del entorno**: SO, navegador, versión de Node.js

### Sugerir Mejoras

Las sugerencias de mejoras son bienvenidas. Incluye:

- Caso de uso claro
- Beneficios de la mejora
- Posibles implementaciones

### Pull Requests

1. Sigue el [proceso de desarrollo](#proceso-de-desarrollo)
2. Sigue los [estándares de código](#estándares-de-código)
3. Actualiza la documentación si es necesario
4. Asegúrate de que todos los tests pasen
5. Describe claramente los cambios en el PR

## 🛠️ Configuración del Entorno de Desarrollo

### Requisitos Previos

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git
```

### Setup Inicial

1. **Fork el repositorio**

2. **Clona tu fork**

```bash
git clone https://github.com/TU-USUARIO/roadwarnings-frontend.git
cd roadwarnings-frontend
```

3. **Agrega el upstream remoto**

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/roadwarnings-frontend.git
```

4. **Instala dependencias**

```bash
npm install
```

5. **Configura variables de entorno**

```bash
cp .env.example .env
# Edita .env con tus valores
```

6. **Inicia el servidor de desarrollo**

```bash
npm run dev
```

## 🔄 Proceso de Desarrollo

### 1. Crea una Rama

```bash
# Actualiza tu rama main
git checkout main
git pull upstream main

# Crea una nueva rama
git checkout -b feature/nombre-del-feature
# o
git checkout -b fix/nombre-del-bug
```

Nomenclatura de ramas:

- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Agregar o mejorar tests
- `chore/` - Tareas de mantenimiento

### 2. Desarrolla

- Escribe código limpio y mantenible
- Sigue los estándares de código
- Agrega tests para nuevas funcionalidades
- Actualiza documentación si es necesario

### 3. Testing

```bash
# Ejecuta todos los tests
npm test

# Ejecuta tests en modo watch
npm run test:watch

# Verifica cobertura
npm run test:coverage
```

**Cobertura mínima requerida: 60%**

### 4. Linting

```bash
# Ejecuta ESLint
npm run lint

# El pre-commit hook ejecutará esto automáticamente
```

### 5. Commit

```bash
git add .
git commit -m "tipo: descripción breve"
```

El pre-commit hook ejecutará automáticamente:

- ESLint
- Tests (si es relevante)
- Type checking

### 6. Push

```bash
git push origin feature/nombre-del-feature
```

### 7. Crea Pull Request

- Ve a GitHub y crea el PR
- Llena la plantilla del PR
- Espera la revisión

## 📝 Estándares de Código

### TypeScript

- **Usa tipos estrictos** - No uses `any` a menos que sea absolutamente necesario
- **Interfaces sobre types** - Prefiere interfaces para objetos
- **Nombres descriptivos** - Variables y funciones con nombres claros

```typescript
// ✅ Bueno
interface User {
  id: number;
  username: string;
  email: string;
}

function getUserById(id: number): Promise<User> {
  // ...
}

// ❌ Malo
type U = {
  i: number;
  n: string;
  e: string;
};

function get(x: any): any {
  // ...
}
```

### React

- **Componentes funcionales** - Usa hooks en lugar de clases
- **Props con TypeScript** - Tipado estricto de props
- **Destructuring** - Destructura props y state

```typescript
// ✅ Bueno
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ Malo
export default function Button(props: any) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Naming Conventions

- **Componentes**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useMyHook.ts`)
- **Utilidades**: camelCase (`myUtility.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Archivos de test**: `*.test.tsx` o `*.spec.tsx`

### Imports

Orden de imports:

1. React y librerías externas
2. Componentes internos
3. Hooks y utilidades
4. Types y constantes
5. Estilos (si aplica)

```typescript
// ✅ Bueno
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navigation from "@/components/Navigation";
import AlertCard from "@/components/AlertCard";

import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/utils/dateHelpers";

import type { Alert } from "@/types/Alert";
import { API_BASE_URL } from "@/config/constants";
```

### Estado

- **Zustand para estado global**
- **useState para estado local**
- **No estado derivado** - Calcula en render si es posible

### Manejo de Errores

- **Try-catch para operaciones async**
- **Error boundaries para componentes**
- **Mensajes de error claros** para el usuario

```typescript
// ✅ Bueno
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error("Error fetching data:", error);
  notificationService.error("No se pudieron cargar los datos");
  throw error;
}
```

### Performance

- **React.memo** para componentes pesados
- **useMemo** para cálculos costosos
- **useCallback** para funciones en props
- **Lazy loading** para componentes grandes

## 💬 Commits y Pull Requests

### Formato de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(alcance): descripción breve

Descripción detallada (opcional)

Footer (opcional)
```

**Tipos permitidos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma faltantes, etc.
- `refactor`: Refactorización de código
- `test`: Agregar o mejorar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
feat(auth): agregar refresh token
fix(alerts): corregir filtrado por severidad
docs(readme): actualizar instrucciones de instalación
test(auth): agregar tests para login
refactor(stores): simplificar authStore
```

### Pull Request Template

Al crear un PR, incluye:

```markdown
## Descripción

Breve descripción de los cambios

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Checklist

- [ ] El código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests
- [ ] Los tests pasan localmente
- [ ] La cobertura de tests no ha disminuido

## Screenshots (si aplica)
```

### Revisión de Código

Tu PR será revisado por:

- Cumplimiento de estándares
- Tests adecuados
- Documentación actualizada
- Sin introducir bugs

**Responde a los comentarios** de manera constructiva.

## 🐛 Reporte de Bugs

### Antes de Reportar

1. Actualiza a la última versión
2. Busca en issues existentes
3. Recopila información del error

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara del problema

**Para Reproducir**
Pasos para reproducir:

1. Ve a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento Esperado**
Qué esperabas que sucediera

**Screenshots**
Si aplica, agrega screenshots

**Entorno:**

- SO: [ej. Windows 11]
- Navegador: [ej. Chrome 120]
- Versión: [ej. 1.0.0]

**Información Adicional**
Cualquier contexto adicional
```

## ✨ Solicitud de Features

### Template de Feature Request

```markdown
**¿El feature está relacionado con un problema?**
Descripción clara del problema

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que suceda

**Alternativas consideradas**
Otras soluciones que has considerado

**Contexto adicional**
Screenshots, mockups, ejemplos
```

## 🧪 Testing

### Escribir Tests

```typescript
import { render, screen, fireEvent } from '@/test/test-utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Coverage

- **Componentes críticos**: 80%+
- **Utilidades y helpers**: 90%+
- **Stores**: 80%+
- **API layers**: 70%+

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Preguntas

Si tienes preguntas:

1. Revisa la documentación existente
2. Busca en issues cerrados
3. Abre un nuevo issue con la etiqueta `question`

## 🙏 Agradecimientos

¡Gracias por contribuir a Road Warnings Frontend!

Tu esfuerzo ayuda a hacer este proyecto mejor para todos.

---

**¡Happy Coding! 🚀**
