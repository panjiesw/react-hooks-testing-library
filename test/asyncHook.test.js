import Promise from 'promise'
import { useState, useEffect } from 'react'
import { renderHook, cleanup, act } from 'src'

describe('async hook tests', () => {
  const getSomeName = () => Promise.resolve('Betty')

  const useName = (prefix) => {
    const [name, setName] = useState('nobody')

    useEffect(() => {
      getSomeName().then((theName) => {
        setName(prefix ? `${prefix} ${theName}` : theName)
      })
    }, [prefix])

    return name
  }

  const useNonNobodyName = (prefix) => {
    const [name, setName] = useState('nobody')

    useEffect(() => {
      getSomeName().then((theName) => {
        setName(prefix ? `${prefix} ${theName}` : theName)
      })
    }, [prefix])

    return [name, setName]
  }

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useFakeTimers()
    cleanup()
  })

  test('should update when not nobody', () => {
    const { result } = renderHook(() => useNonNobodyName())

    expect(result.current[0]).toBe('nobody')

    act(() => {
      result.current[1]('someone')
    })

    act(() => {
      jest.runAllTimers()
    })

    expect(result.current[0]).toBe('Betty')
  })

  test.skip('should wait for next update', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useName())

    expect(result.current).toBe('nobody')

    await waitForNextUpdate()

    expect(result.current).toBe('Betty')
  })

  test.skip('should wait for multiple updates', async () => {
    const { result, waitForNextUpdate, rerender } = renderHook(({ prefix }) => useName(prefix), {
      initialProps: { prefix: 'Mrs.' }
    })

    expect(result.current).toBe('nobody')

    await waitForNextUpdate()

    expect(result.current).toBe('Mrs. Betty')

    rerender({ prefix: 'Ms.' })

    await waitForNextUpdate()

    expect(result.current).toBe('Ms. Betty')
  })

  test.skip('should resolve all when updating', async () => {
    const { result, waitForNextUpdate } = renderHook(({ prefix }) => useName(prefix), {
      initialProps: { prefix: 'Mrs.' }
    })

    expect(result.current).toBe('nobody')

    await Promise.all([waitForNextUpdate(), waitForNextUpdate(), waitForNextUpdate()])

    expect(result.current).toBe('Mrs. Betty')
  })
})
