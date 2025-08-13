import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { SmartForm, SmartInput } from '@/components/forms/SmartForm'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
})

describe('SmartForm', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('valida e envia o formulário', async () => {
    const onSubmit = vi.fn(async () => {})

    // garantir online
    Object.defineProperty(window.navigator, 'onLine', { value: true, configurable: true })

    const { container } = rtlRender(
      <SmartForm 
        schema={schema} 
        defaultValues={{ name: '' }} 
        onSubmit={onSubmit}
        autoSave={{ enabled: true, interval: 10, key: 'submit-form' }}
      >
        {(form) => (
          <SmartInput form={form} name={'name'} label="Nome" placeholder="Seu nome" />
        )}
      </SmartForm>
    )

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    // Use fireEvent instead of userEvent to avoid pointer-events issues
    fireEvent.change(nameInput, { target: { value: 'Jo' } })
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })

  it('salva automaticamente no localStorage quando autosave está habilitado', async () => {
    const onSubmit = vi.fn(async () => {})

    vi.useFakeTimers()
    const { container } = rtlRender(
      <SmartForm
        schema={schema}
        defaultValues={{ name: '' }}
        onSubmit={onSubmit}
        autoSave={{ enabled: true, interval: 10, key: 'test-form' }}
      >
        {(form) => (
          <SmartInput form={form} name={'name'} label="Nome" placeholder="Seu nome" />
        )}
      </SmartForm>
    )

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'John' } })

    // aguardar o intervalo de autosave
    await act(async () => {
      vi.advanceTimersByTime(20)
    })

    const saved = localStorage.getItem('test-form')
    expect(saved).toBeTruthy()
    expect(JSON.parse(saved || '{}').name).toBe('John')
    vi.useRealTimers()
  })
})
