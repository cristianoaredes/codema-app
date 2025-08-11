# CODEMA Auth & User Management - Claude Code CLI Prompt

## Quick Context
CODEMA (Municipal Environmental Council) system for Itanhomi/MG municipality. React+TypeScript+Supabase with 5 modules and multiple user profiles.

## Required Analysis

### 1. Current Authentication State
- Review `src/hooks/useAuth.tsx` and `src/components/AuthPage.tsx`
- Check Supabase Auth integration in `src/integrations/supabase/`
- Analyze existing roles/profiles system

### 2. User Management
- Examine `src/components/UserManagement.tsx` and existing functionalities
- Check if it allows creating/editing/deactivating users
- Analyze access control by profile (admin, secretary, president, councilors)

### 3. Implement Missing Features

**HIGH PRIORITY:**
- [ ] Complete CRUD interface for users (admin can create/edit/deactivate)
- [ ] Institutional email validation (.gov.br for certain profiles)
- [ ] Email invitation system for new users
- [ ] Password reset by admin
- [ ] User action auditing

**MEDIUM PRIORITY:**
- [ ] Granular permission profiles by module
- [ ] Approval system for new registrations
- [ ] Email notifications for profile changes
- [ ] Login/activity history

## Implementation Guidelines

1. **Use existing components** from shadcn/ui whenever possible
2. **Follow established patterns** in the project
3. **Implement proper security** for each profile
4. **Create intuitive interfaces** for different user types
5. **Maintain consistency** with existing design system

## User Profiles
- **Admin**: Full system and user control
- **Secretary**: Manages meetings and documents
- **President**: Approves decisions and reports
- **Councilors**: Participate in meetings and voting
- **Citizens**: Submit complaints via ombudsman

## Useful Commands
```bash
# Analyze current auth
npm run dev  # Test login/logout

# Check Supabase
npx supabase status
```

## Deliverables
1. Complete and functional user management system
2. Refined access control by profile
3. Intuitive administrative interface
4. Documentation of implemented features

**Focus**: Implement features that allow admin to efficiently and securely manage all system users. 