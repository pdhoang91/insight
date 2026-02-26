import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { slug, type, secret } = await request.json();

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    switch (type) {
      case 'post':
        if (slug) {
          revalidatePath(`/p/${slug}`);
        }
        revalidatePath('/');
        break;
      case 'category':
        revalidatePath('/category');
        if (slug) revalidatePath(`/category/${slug}`);
        break;
      case 'all':
        revalidatePath('/', 'layout');
        break;
      default:
        if (slug) {
          revalidatePath(`/p/${slug}`);
        }
        revalidatePath('/');
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error revalidating', error: err.message },
      { status: 500 }
    );
  }
}
