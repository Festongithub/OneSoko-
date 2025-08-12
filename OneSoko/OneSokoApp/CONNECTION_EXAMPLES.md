# Frontend-Backend Connection Examples

## 🔗 **How Frontend Connects to Django Backend**

### **1. Authentication Flow**

```typescript
// Frontend: src/services/api.ts
export const authAPI = {
  login: async (credentials: LoginForm) => {
    const response = await api.post('/token/', credentials);
    // Stores tokens in localStorage
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    return response.data;
  }
};

// Usage in component
const handleLogin = async () => {
  try {
    const result = await authAPI.login({
      username: 'user@example.com',
      password: 'password123'
    });
    // User is now authenticated
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

**Django Backend Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### **2. Product Fetching Flow**

```typescript
// Frontend: src/services/api.ts
export const productsAPI = {
  getAll: async (filters?: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters?.category) {
      params.append('category', filters.category);
    }
    const response = await api.get(`/products/?${params.toString()}`);
    return response.data;
  }
};

// Usage in component
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAll({ category: 'electronics' });
      setProducts(data.results);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };
  fetchProducts();
}, []);
```

**Django Backend Response:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Smartphone",
      "description": "Latest smartphone model",
      "price": "599.99",
      "quantity": 10,
      "category": {
        "id": 1,
        "name": "Electronics",
        "slug": "electronics"
      }
    }
  ]
}
```

### **3. Shopping Cart Flow**

```typescript
// Frontend: Redux store
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, shop } = action.payload;
      // Add to local cart state
      state.items.push({ product, quantity, shop });
    }
  }
});

// When user checks out
const handleCheckout = async () => {
  try {
    const orderData = {
      shop: selectedShop.shopId,
      products: cartItems.map(item => ({
        product: item.product.productId,
        quantity: item.quantity
      }))
    };
    
    const order = await ordersAPI.create(orderData);
    // Clear cart and redirect to order confirmation
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

**Django Backend Order Creation:**
```python
# views.py
class OrderViewSet(viewsets.ModelViewSet):
    def create(self, request):
        # Creates order in database
        order = Order.objects.create(
            user=request.user,
            shop_id=request.data['shop'],
            total=calculate_total(request.data['products'])
        )
        # Creates order items
        for item in request.data['products']:
            OrderItem.objects.create(
                order=order,
                product_id=item['product'],
                quantity=item['quantity']
            )
        return Response(OrderSerializer(order).data)
```

### **4. Real-time Messaging Flow**

```typescript
// Frontend: Message component
const [messages, setMessages] = useState<Message[]>([]);

const sendMessage = async (content: string, recipientId: number) => {
  try {
    const message = await messagesAPI.send({
      recipient: recipientId,
      content: content
    });
    setMessages(prev => [...prev, message]);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

// Poll for new messages
useEffect(() => {
  const interval = setInterval(async () => {
    const unreadCount = await messagesAPI.getUnreadCount();
    if (unreadCount > 0) {
      // Update UI to show new messages
    }
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, []);
```

**Django Backend Message Handling:**
```python
# views.py
class MessageViewSet(viewsets.ModelViewSet):
    def create(self, request):
        message = Message.objects.create(
            sender=request.user,
            recipient_id=request.data['recipient'],
            content=request.data['content']
        )
        return Response(MessageSerializer(message).data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Message.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        return Response({'count': count})
```

## 🔧 **Error Handling & Token Refresh**

### **Automatic Token Refresh**

```typescript
// Frontend: Automatic token refresh in api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken
        });
        
        localStorage.setItem('access_token', response.data.access);
        error.config.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### **Error Handling**

```typescript
// Frontend: Centralized error handling
const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Please check your input and try again.';
      case 401:
        return 'You are not authorized to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unknown error occurred.';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message;
};
```

## 🚀 **Testing the Connection**

### **1. Test Backend Connection**

```typescript
// Add this component to test connection
import BackendConnectionTest from './components/BackendConnectionTest';

function App() {
  return (
    <div>
      <BackendConnectionTest />
      {/* Your other components */}
    </div>
  );
}
```

### **2. Manual API Testing**

```bash
# Test Django backend directly
curl -X GET http://localhost:8000/api/products/

# Test with authentication
curl -X GET http://localhost:8000/api/products/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **3. Browser Network Tab**

1. Open Developer Tools (F12)
2. Go to Network tab
3. Perform actions in your app
4. Check API requests and responses

## 🔒 **Security Considerations**

### **1. CORS Configuration**

```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://yourdomain.com", # Production
]

CORS_ALLOW_CREDENTIALS = True
```

### **2. JWT Token Security**

```typescript
// Frontend: Secure token storage
const storeToken = (token: string) => {
  localStorage.setItem('access_token', token);
  // Consider using httpOnly cookies for production
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};
```

### **3. API Rate Limiting**

```python
# Django: Add rate limiting
from rest_framework.throttling import UserRateThrottle

class ProductViewSet(viewsets.ModelViewSet):
    throttle_classes = [UserRateThrottle]
    # 100 requests per hour per user
```

## 📊 **Monitoring & Debugging**

### **1. API Request Logging**

```typescript
// Frontend: Log all API requests
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use((response) => {
  console.log('API Response:', response.status, response.config.url);
  return response;
});
```

### **2. Django Debug Logging**

```python
# Django: Log API requests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

This connection architecture ensures secure, reliable communication between your React frontend and Django backend! 🚀 