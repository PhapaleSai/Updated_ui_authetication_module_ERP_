import asyncio
import httpx

async def test_brochure():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://127.0.0.1:8000/api/v1/brochures/request",
            json={"user_id": 1, "course_name": "B.Tech Computer Science"}
        )
        print("Status:", response.status_code)
        print("Response:", response.text)

if __name__ == "__main__":
    asyncio.run(test_brochure())
