# Email Subscription System Documentation

## Overview

The OneSoko email subscription system allows users to subscribe to newsletters and promotional emails. The system includes:

- ✅ **Email validation and duplicate prevention**
- ✅ **Confirmation email with HTML template**
- ✅ **Token-based email confirmation**
- ✅ **Subscription status tracking**
- ✅ **Unsubscribe functionality**
- ✅ **Django admin interface**
- ✅ **Multiple subscription types**
- ✅ **Real-time form feedback**

## API Endpoints

### 1. Subscribe to Newsletter

**POST** `/api/email-subscription/subscribe/`

**Body:**
```json
{
  "email": "user@example.com",
  "subscription_types": ["newsletter", "promotions", "updates"]
}
```

**Response (201):**
```json
{
  "message": "Subscription created successfully! Please check your email to confirm.",
  "subscription_id": "uuid-here",
  "email": "user@example.com"
}
```

### 2. Confirm Subscription

**GET** `/api/email-subscription/confirm/?token=confirmation-token`

**Response (200):**
```json
{
  "message": "Email subscription confirmed successfully!",
  "email": "user@example.com"
}
```

### 3. Check Subscription Status

**GET** `/api/email-subscription/status/?email=user@example.com`

**Response (200):**
```json
{
  "subscriptionId": "uuid-here",
  "email": "user@example.com",
  "subscription_types": ["newsletter", "promotions"],
  "is_active": true,
  "created_at": "2025-08-19T10:46:20.989490Z",
  "updated_at": "2025-08-19T10:46:46.679530Z",
  "confirmed_at": "2025-08-19T10:46:46.679384Z",
  "is_confirmed": true
}
```

### 4. Unsubscribe

**POST** `/api/email-subscription/unsubscribe/`

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Successfully unsubscribed from email notifications",
  "email": "user@example.com"
}
```

## Frontend Components

### NewsletterSubscription Component

The `NewsletterSubscription` component is a reusable React component with multiple variants:

- **default**: Standard form with title and description
- **minimal**: Compact form for tight spaces
- **banner**: Large promotional banner style

**Usage:**
```tsx
import { NewsletterSubscription } from '../components/newsletter';

// Minimal variant in footer
<NewsletterSubscription variant="minimal" />

// Banner variant for landing pages
<NewsletterSubscription variant="banner" />

// Default with custom styling
<NewsletterSubscription 
  variant="default" 
  showTitle={true}
  placeholder="Your email address"
  buttonText="Join Newsletter"
/>
```

## Database Model

The `EmailSubscription` model includes:

- `subscriptionId`: UUID primary key
- `email`: Unique email address
- `subscription_types`: JSON field with subscription preferences
- `is_active`: Boolean subscription status
- `user`: Optional link to registered user
- `confirmed_at`: Timestamp of email confirmation
- `confirmation_token`: Security token for email verification

## Email Templates

HTML email templates are located in `/templates/emails/`:

- `subscription_confirmation.html`: Welcome email with confirmation link

## Admin Interface

Access the Django admin at `/admin/` to manage subscriptions:

- View all subscriptions with filtering and search
- Bulk actions to confirm, activate, or unsubscribe users
- Export subscription data
- View subscription analytics

## Testing

1. **Frontend Test Page**: Visit `/newsletter-test` to test all component variants
2. **API Testing**: Use the provided curl commands or Postman collection
3. **Email Testing**: Check Django console for email output in development

## Configuration

Email settings in `settings.py`:

```python
# Development (console backend)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Production (SMTP backend)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-email-password'
```

## Security Features

- **Token-based confirmation**: Prevents unauthorized subscriptions
- **Email validation**: Ensures valid email addresses
- **Duplicate prevention**: Prevents multiple subscriptions with same email
- **CORS enabled**: Allows frontend integration
- **Permission-based**: Anonymous users can subscribe, authenticated users are linked

## Future Enhancements

- [ ] Email campaign management
- [ ] Subscription preferences page
- [ ] A/B testing for email templates
- [ ] Analytics dashboard
- [ ] Integration with marketing tools
- [ ] Automated welcome series
- [ ] Segmentation by subscription type
