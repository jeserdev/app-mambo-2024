import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import AddToCartPopup from './AddToCartPopup'

describe('AddToCartPopup', () => {
  test('renders correctly', () => {
    const product = {
      name: 'Product 1',
      kilosAvailable: 10,
      boxesAvailable: 5,
    }
    const onClose = jest.fn()

    const { getByText, getByTestId } = render(
      <AddToCartPopup product={product} onClose={onClose} />
    )

    // Check if product name is displayed
    expect(getByText('Product 1')).toBeTruthy()

    // Check if quantity selection is displayed
    expect(getByTestId('quantity-input')).toBeTruthy()

    // Check if unit selection is displayed
    expect(getByTestId('unit-button-kilos')).toBeTruthy()
    expect(getByTestId('unit-button-cajas')).toBeTruthy()

    // Check if stock and add to cart button are displayed
    expect(getByText('Stock disponible: 10 kilos')).toBeTruthy()
    expect(getByTestId('add-to-cart-button')).toBeTruthy()
  })

  test('increases quantity when "+" button is pressed', () => {
    const product = {
      name: 'Product 1',
      kilosAvailable: 10,
      boxesAvailable: 5,
    }
    const onClose = jest.fn()

    const { getByTestId } = render(
      <AddToCartPopup product={product} onClose={onClose} />
    )

    const quantityInput = getByTestId('quantity-input')
    const increaseButton = getByTestId('increase-quantity-button')

    // Check initial quantity
    expect(quantityInput.props.value).toBe('1')

    // Increase quantity
    fireEvent.press(increaseButton)

    // Check if quantity is increased
    expect(quantityInput.props.value).toBe('2')
  })

  test('decreases quantity when "-" button is pressed', () => {
    const product = {
      name: 'Product 1',
      kilosAvailable: 10,
      boxesAvailable: 5,
    }
    const onClose = jest.fn()

    const { getByTestId } = render(
      <AddToCartPopup product={product} onClose={onClose} />
    )

    const quantityInput = getByTestId('quantity-input')
    const decreaseButton = getByTestId('decrease-quantity-button')

    // Set initial quantity to 3
    fireEvent.changeText(quantityInput, '3')

    // Check initial quantity
    expect(quantityInput.props.value).toBe('3')

    // Decrease quantity
    fireEvent.press(decreaseButton)

    // Check if quantity is decreased
    expect(quantityInput.props.value).toBe('2')
  })

  test('calls onClose function when modal is closed', () => {
    const product = {
      name: 'Product 1',
      kilosAvailable: 10,
      boxesAvailable: 5,
    }
    const onClose = jest.fn()

    const { getByTestId } = render(
      <AddToCartPopup product={product} onClose={onClose} />
    )

    const closeModalButton = getByTestId('close-modal-button')

    // Close modal
    fireEvent.press(closeModalButton)

    // Check if onClose function is called
    expect(onClose).toHaveBeenCalled()
  })

  test('calls handleAddToCart function when add to cart button is pressed', () => {
    const product = {
      name: 'Product 1',
      kilosAvailable: 10,
      boxesAvailable: 5,
    }
    const onClose = jest.fn()

    const { getByTestId } = render(
      <AddToCartPopup product={product} onClose={onClose} />
    )

    const addToCartButton = getByTestId('add-to-cart-button')

    // Add to cart
    fireEvent.press(addToCartButton)

    // TODO: Check if handleAddToCart function is called
  })
})
