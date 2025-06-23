# Contributing to Order Viewer Dashboard

Thank you for your interest in contributing to the Order Viewer Dashboard! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professionalism in all interactions

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/order-viewer.git
   cd order-viewer
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/order-viewer.git
   ```

## 🛠️ Development Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Set up the database**:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 💡 Making Changes

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for major changes to discuss the approach
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Types of Contributions

- 🐛 **Bug fixes**: Fix existing functionality
- ✨ **Features**: Add new functionality
- 📚 **Documentation**: Improve or add documentation
- 🎨 **UI/UX**: Improve user interface or experience
- ⚡ **Performance**: Optimize performance
- 🔧 **Refactoring**: Improve code structure without changing functionality

## 📝 Coding Standards

### TypeScript

- **Type Safety**: Use strict TypeScript, avoid `any`
- **Interfaces**: Prefer interfaces over types for object shapes
- **Enums**: Use const assertions or string literal unions instead of enums
- **Null Safety**: Handle null/undefined cases explicitly

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string | null;
}

// ❌ Avoid
type User = {
  id: any;
  name: string;
  email?: string;
};
```

### React Components

- **Functional Components**: Use function components with hooks
- **Component Names**: Use PascalCase for components
- **Props Interface**: Define props interface above component
- **Default Props**: Use ES6 default parameters

```tsx
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  onClick,
  children,
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### Database & API

- **Zod Validation**: All API inputs must be validated with Zod
- **Error Handling**: Use consistent error responses
- **SQL Queries**: Use Drizzle ORM, avoid raw SQL
- **Transactions**: Use database transactions for multi-table operations

```typescript
// ✅ Good
export async function updateOrderPayment(orderId: string, paid: boolean) {
  try {
    const result = await db
      .update(orders)
      .set({ paid, updatedAt: new Date() })
      .where(eq(orders.orderId, orderId))
      .returning();

    return { success: true, order: result[0] };
  } catch (error) {
    return { success: false, error: 'Failed to update payment status' };
  }
}
```

### Styling

- **Tailwind CSS**: Use Tailwind utility classes
- **Component Variants**: Use `class-variance-authority` for variants
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Support both light and dark themes

```tsx
// ✅ Good
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

## 🧪 Testing

### Manual Testing

- Test your changes in both light and dark modes
- Verify responsiveness on mobile, tablet, and desktop
- Test all filter combinations
- Verify optimistic updates work correctly
- Check error states and loading states

### Checklist

- [ ] Component renders without errors
- [ ] Props are properly typed
- [ ] Responsive design works on all screen sizes
- [ ] Dark/light theme support
- [ ] Accessibility standards met (ARIA labels, keyboard navigation)
- [ ] No console errors or warnings
- [ ] Loading and error states handled
- [ ] API endpoints return expected data

## 📤 Submitting Changes

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(filters): add date range filter with calendar picker

fix(api): handle null values in order stats calculation

docs(readme): add database schema documentation
```

### Pull Request Process

1. **Update your branch** with the latest changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** with:

   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Test instructions

4. **PR Description Template**:

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement

   ## Testing

   - [ ] Manual testing completed
   - [ ] Responsive design verified
   - [ ] Dark/light mode tested

   ## Screenshots

   (If applicable)

   ## Related Issues

   Fixes #123
   ```

## 🔍 Review Process

### What Reviewers Look For

- **Code Quality**: Clean, readable, and maintainable code
- **Performance**: Efficient algorithms and database queries
- **Security**: Proper input validation and error handling
- **Accessibility**: WCAG guidelines compliance
- **User Experience**: Intuitive and responsive design

### Addressing Feedback

- Respond promptly to review comments
- Make requested changes in separate commits
- Explain your reasoning if you disagree with feedback
- Ask questions if requirements are unclear

## 🎯 Development Tips

### Performance

- Use React Query for server state management
- Implement proper loading states
- Debounce user input (search, filters)
- Optimize database queries with proper indexes

### User Experience

- Provide immediate feedback for user actions
- Use optimistic updates where appropriate
- Handle error states gracefully
- Ensure keyboard navigation works

### Database

- Use database indexes for frequently queried columns
- Implement proper foreign key constraints
- Use transactions for data consistency
- Validate all inputs with Zod schemas

## 🤝 Getting Help

- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Tag maintainers for code review
- **Documentation**: Check existing docs before asking questions

Thank you for contributing to Order Viewer Dashboard! 🎉
