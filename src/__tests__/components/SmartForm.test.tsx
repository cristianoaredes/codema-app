import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test-utils/render'
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

    render(
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

    await userEvent.type(screen.getByPlaceholderText('Seu nome'), 'Jo')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })

  it('salva automaticamente no localStorage quando autosave está habilitado', async () => {
    const onSubmit = vi.fn(async () => {})

    vi.useFakeTimers()
    render(
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

    fireEvent.change(screen.getByPlaceholderText('Seu nome'), { target: { value: 'John' } })

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
