'use client'

import { toaster } from '@/components/ui/toaster'

export const errorToaster = (description: string, title: string = 'Error') => {
    toaster.create({
        title: title,
        description: description,
        type: "error",
        duration: 3000,
        closable: true,
    })
}

export const successToaster = (description: string, title: string = 'Success') => {
    toaster.create({
        title: title,
        description: description,
        type: "success",
        duration: 3000,
        closable: true,
    })
}

export const warningToaster = (description: string, title: string = 'Warning') => {
    toaster.create({
        title: title,
        description: description,
        type: "warning",
        duration: 3000,
        closable: true,
    })
}

export const infoToaster = (description: string, title: string = 'Info') => {
    toaster.create({
        title: title,
        description: description,
        type: "info",
        duration: 3000,
        closable: true,
    })
}