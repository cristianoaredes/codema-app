import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone
} from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { Checkbox } from "./checkbox"
import { FeedbackData } from "@/types/feedback"

// Sistema de avaliação por estrelas
interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  max?: number
  size?: "sm" | "md" | "lg"
  readonly?: boolean
  className?: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  max = 5,
  size = "md",
  readonly = false,
  className
}) => {
  const [hoverValue, setHoverValue] = React.useState(0)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= (hoverValue || value)

        return (
          <button
            key={index}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={cn(
              "transition-colors",
              !readonly && "hover:scale-110 cursor-pointer",
              readonly && "cursor-default"
            )}
            aria-label={`Avaliar ${starValue} estrela${starValue > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-400"
              )}
            />
          </button>
        )
      })}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value}/{max}
        </span>
      )}
    </div>
  )
}

// Botões de feedback rápido
interface QuickFeedbackProps {
  onFeedback: (type: 'positive' | 'negative', comment?: string) => void
  className?: string
}

export const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  onFeedback,
  className
}) => {
  const [showComment, setShowComment] = React.useState<'positive' | 'negative' | null>(null)
  const [comment, setComment] = React.useState("")

  const handleSubmit = (type: 'positive' | 'negative') => {
    onFeedback(type, comment.trim() || undefined)
    setShowComment(null)
    setComment("")
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Esta página foi útil?</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComment('positive')}
          className="flex items-center gap-1"
        >
          <ThumbsUp className="h-4 w-4" />
          Sim
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComment('negative')}
          className="flex items-center gap-1"
        >
          <ThumbsDown className="h-4 w-4" />
          Não
        </Button>
      </div>

      {showComment && (
        <div className="p-3 border rounded-md bg-muted/50">
          <Textarea
            placeholder="Conte-nos mais sobre sua experiência (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-2"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleSubmit(showComment)}
            >
              <Send className="h-4 w-4 mr-1" />
              Enviar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowComment(null)
                setComment("")
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Formulário de feedback detalhado
interface DetailedFeedbackFormProps {
  onSubmit: (feedback: FeedbackData) => void
  onCancel: () => void
  className?: string
}



export const DetailedFeedbackForm: React.FC<DetailedFeedbackFormProps> = ({
  onSubmit,
  onCancel,
  className
}) => {
  const [formData, setFormData] = React.useState<Partial<FeedbackData>>({
    type: 'suggestion',
    priority: 'medium',
    rating: 0,
    allowContact: false,
    page: window.location.pathname,
    userAgent: navigator.userAgent
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title && formData.description) {
      onSubmit(formData as FeedbackData)
    }
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enviar Feedback
        </CardTitle>
        <CardDescription>
          Sua opinião é importante para melhorarmos o sistema CODEMA
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de feedback */}
          <div className="space-y-2">
            <Label>Tipo de feedback</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value as FeedbackData['type']})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">🐛 Reportar Bug</SelectItem>
                <SelectItem value="suggestion">💡 Sugestão</SelectItem>
                <SelectItem value="compliment">👏 Elogio</SelectItem>
                <SelectItem value="other">📝 Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <RadioGroup 
              value={formData.priority} 
              onValueChange={(value) => setFormData({...formData, priority: value as FeedbackData['priority']})}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Baixa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Média</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">Alta</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Descreva brevemente o feedback"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição detalhada *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente sua experiência, problema ou sugestão"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              required
            />
          </div>

          {/* Avaliação geral */}
          <div className="space-y-2">
            <Label>Avaliação geral do sistema</Label>
            <StarRating
              value={formData.rating || 0}
              onChange={(rating) => setFormData({...formData, rating})}
            />
          </div>

          {/* Email para contato */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email || ''}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Permissão para contato */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowContact"
              checked={formData.allowContact}
              onCheckedChange={(checked) => setFormData({...formData, allowContact: !!checked})}
            />
            <Label htmlFor="allowContact" className="text-sm">
              Permito contato para esclarecimentos sobre este feedback
            </Label>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={!formData.title || !formData.description}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Feedback
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Widget de feedback flutuante
interface FeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  onFeedbackSubmit: (feedback: FeedbackData) => void
  className?: string
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  position = 'bottom-right',
  onFeedbackSubmit,
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'button' | 'quick' | 'detailed'>('button')

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  const handleQuickFeedback = (type: 'positive' | 'negative', comment?: string) => {
    onFeedbackSubmit({ type, comment, timestamp: new Date().toISOString() })
    setMode('button')
    setIsOpen(false)
  }

  const handleDetailedFeedback = (feedback: FeedbackData) => {
    onFeedbackSubmit({ ...feedback, timestamp: new Date().toISOString() })
    setMode('button')
    setIsOpen(false)
  }

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {mode === 'button' && (
        <Button
          onClick={() => {
            setIsOpen(true)
            setMode('quick')
          }}
          className="rounded-full shadow-lg"
          size="lg"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Feedback
        </Button>
      )}

      {isOpen && mode === 'quick' && (
        <Card className="w-80 mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Feedback Rápido</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  setMode('button')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickFeedback onFeedback={handleQuickFeedback} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('detailed')}
              className="w-full"
            >
              Feedback Detalhado
            </Button>
          </CardContent>
        </Card>
      )}

      {isOpen && mode === 'detailed' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <DetailedFeedbackForm
            onSubmit={handleDetailedFeedback}
            onCancel={() => {
              setMode('button')
              setIsOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}


