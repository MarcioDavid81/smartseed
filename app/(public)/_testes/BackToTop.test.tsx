import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BackToTop } from '../_components/BackToTop'
import { act } from 'react'
import '@testing-library/jest-dom'

beforeEach(() => {
  window.scrollTo = jest.fn()
})

describe('BackToTop', () => {
  it('não renderiza o botão se não houver scroll', () => {
    render(<BackToTop />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renderiza o botão após scroll e volta ao topo ao clicar', async () => {
    render(<BackToTop />)
    Object.defineProperty(window, 'scrollY', { value: 600, writable: true })
    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    const button = await screen.findByRole('button')
    expect(button).toBeInTheDocument()

    await act(async () => {
      await userEvent.click(button)
    })

    expect(window.scrollTo).toHaveBeenCalled()
  })
})