import asyncio
import edge_tts
import time

async def main():
    text = "Hello. I'm Nivi. Welcome to this quiet space. How are your mind and body feeling right now? Take a deep breath and let's get started on your wellness journey. I am here to help you achieve your goals."
    voice = "en-US-EmmaNeural"
    
    start = time.time()
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save("test_long.mp3")
    print(f"Total time to save full long audio: {time.time() - start:.3f}s")
                
if __name__ == "__main__":
    asyncio.run(main())
