# CODEMA Management System - Architecture Design

## Phase 1: Foundation Modules

### 1. Councillor Management Module

#### Components Structure:
```
src/pages/codema/
├── conselheiros/
│   ├── index.tsx              # List all councillors
│   ├── create.tsx             # Add new councillor
│   ├── [id]/
│   │   ├── edit.tsx          # Edit councillor details
│   │   └── view.tsx          # View councillor profile
│   └── components/
│       ├── CouncillorForm.tsx
│       ├── CouncillorList.tsx
│       ├── CouncillorCard.tsx
│       └── MandateAlerts.tsx

src/components/codema/
├── councillors/
│   ├── CouncillorStatusBadge.tsx
│   ├── EntitySelector.tsx
│   └── MandateTimeline.tsx
```

#### Features:
- CRUD operations for councillors
- Mandate tracking with expiration alerts
- Attendance tracking and absence notifications
- Entity representation management
- Impediment/conflict of interest tracking

### 2. Meeting Agenda & Convocation Module

#### Components Structure:
```
src/pages/codema/
├── reunioes/
│   ├── index.tsx              # Meeting calendar
│   ├── create.tsx             # Schedule new meeting
│   ├── [id]/
│   │   ├── edit.tsx          # Edit meeting details
│   │   ├── convocation.tsx   # Generate convocation
│   │   └── attendance.tsx    # Mark attendance
│   └── components/
│       ├── MeetingCalendar.tsx
│       ├── ConvocationForm.tsx
│       ├── AttendanceSheet.tsx
│       └── MeetingNotifications.tsx

src/components/codema/
├── meetings/
│   ├── MeetingTypeBadge.tsx
│   ├── QuorumIndicator.tsx
│   ├── ConvocationPreview.tsx
│   └── EmailWhatsAppSender.tsx
```

#### Features:
- Annual meeting calendar
- Automatic convocation generation (7 days for ordinary, 48h for extraordinary)
- Email/WhatsApp integration for notifications
- Attendance confirmation system
- Quorum verification

### 3. Electronic Minutes Module

#### Components Structure:
```
src/pages/codema/
├── atas/
│   ├── index.tsx              # List all minutes
│   ├── create.tsx             # Create new minutes
│   ├── [id]/
│   │   ├── edit.tsx          # Edit draft minutes
│   │   ├── sign.tsx          # Digital signature page
│   │   └── view.tsx          # View final minutes
│   └── components/
│       ├── MinutesEditor.tsx
│       ├── MinutesTemplate.tsx
│       ├── SignaturePanel.tsx
│       └── MinutesExport.tsx

src/components/codema/
├── minutes/
│   ├── RichTextEditor.tsx
│   ├── AttendeesList.tsx
│   ├── DeliberationsList.tsx
│   └── DigitalSignature.tsx
```

#### Features:
- Standardized minutes template
- Rich text editor with formatting
- Digital signature integration (e-CPF)
- PDF/A export for archival
- Automatic publication to transparency portal

### 4. Resolutions Control Module

#### Components Structure:
```
src/pages/codema/
├── resolucoes/
│   ├── index.tsx              # List all resolutions
│   ├── create.tsx             # Draft new resolution
│   ├── [id]/
│   │   ├── edit.tsx          # Edit draft
│   │   ├── vote.tsx          # Voting interface
│   │   └── view.tsx          # View published resolution
│   └── components/
│       ├── ResolutionForm.tsx
│       ├── ResolutionList.tsx
│       ├── VotingPanel.tsx
│       └── ResolutionPublisher.tsx

src/components/codema/
├── resolutions/
│   ├── ResolutionNumber.tsx
│   ├── VotingResults.tsx
│   ├── LegalBasisSelector.tsx
│   └── PublicationStatus.tsx
```

#### Features:
- Automatic numbering (Res. nº XX/YYYY)
- Version control for drafts
- Voting system with impediment tracking
- Digital signature for final version
- Automatic publication and archival

## Shared Components

```
src/components/codema/shared/
├── StatusBadge.tsx
├── DateRangePicker.tsx
├── UserAvatar.tsx
├── DocumentViewer.tsx
├── NotificationCenter.tsx
├── SearchBar.tsx
├── FilterPanel.tsx
└── ExportButtons.tsx
```

## Navigation Updates

Update the navigation structure to include CODEMA modules:

```typescript
// For admin/secretary roles
{
  title: "CODEMA",
  icon: Trees,
  children: [
    { title: "Conselheiros", href: "/codema/conselheiros" },
    { title: "Reuniões", href: "/codema/reunioes" },
    { title: "Atas", href: "/codema/atas" },
    { title: "Resoluções", href: "/codema/resolucoes" }
  ]
}
```

## State Management

Use React Query for data fetching and caching:

```typescript
// src/hooks/codema/
├── useCouncillors.ts
├── useMeetings.ts
├── useMinutes.ts
└── useResolutions.ts
```

## API Integration

Supabase functions for each module:

```typescript
// src/lib/codema/
├── councillors.ts
├── meetings.ts
├── minutes.ts
└── resolutions.ts
```

## Implementation Priority

1. **Week 1-2**: Councillor Management
   - Basic CRUD
   - Mandate tracking
   - Entity management

2. **Week 3-4**: Meeting & Convocation
   - Calendar interface
   - Convocation generation
   - Notification system

3. **Week 5-6**: Electronic Minutes
   - Template system
   - Rich text editor
   - Digital signatures

4. **Week 7-8**: Resolutions Control
   - Numbering system
   - Voting interface
   - Publication workflow

## Design Patterns

1. **Form Handling**: Use react-hook-form with zod validation
2. **Tables**: Use shadcn/ui DataTable with sorting/filtering
3. **Notifications**: Toast notifications for user feedback
4. **Loading States**: Skeleton screens for better UX
5. **Error Handling**: Consistent error boundaries and messages
6. **Accessibility**: Follow WCAG 2.1 AA standards

## Security Considerations

1. **Role-based Access**: Enforce permissions at component level
2. **Data Validation**: Server-side validation for all inputs
3. **Audit Logging**: Track all CRUD operations
4. **Digital Signatures**: Integration with gov.br/ICP-Brasil
5. **Data Encryption**: Sensitive data encrypted at rest

## Testing Strategy

1. **Unit Tests**: Component logic and utilities
2. **Integration Tests**: API interactions
3. **E2E Tests**: Critical user flows
4. **Accessibility Tests**: Automated a11y checks