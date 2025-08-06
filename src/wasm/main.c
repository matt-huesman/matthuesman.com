#include <stdio.h>

int main()
{
    printf("Hello, WebAssembly!\n");

    return 0;
}

extern int example_function()
{
    return 12;
}