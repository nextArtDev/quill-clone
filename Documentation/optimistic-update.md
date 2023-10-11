## Optimistic updates
when we type a message and hit enter, we need some time to submit message to db and generate response, in optimistic update it is immediately put into the chat, even though it is not in a database yet, but for the user feedback that is amazing.

## Infinite queries
we only show the last number of messages and when ever the user scroll to the top, we fetch others.
first we should pass ref to keep track of which message is the last one, and if that is on the screen then we can load more messages. we use _useIntersecting_ hook from below library:
~ pnpm install @mantine/hooks  

then by the use of useEffect, if _entry?.isIntersecting_ we fetch new messages. 
```typescript
import { useIntersection } from '@mantine/hooks'

//...
  const lastMessageRef = useRef<HTMLDivElement>(null)

    const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  })

  useEffect(() => {
    if (entry?.isIntersecting) {
        //fetching nex page
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  //...

            if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={ref}
                message={message}
                isNextMessageSamePerson={
                  isNextMessageSamePerson
                }
                key={message.id}
              />
            )

```

### passing the ref down by forwardRef

```typescript
interface MessageProps {
  message: ExtendedMessage
  isNextMessageSamePerson: boolean
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
        <div 
        ref={ref}
        className={cn('flex items-end', {
          'justify-end': message.isUserMessage,
        })}>
        //...
        )

Message.displayName = 'Message'

export default Message
```