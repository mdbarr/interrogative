SRCS=$(wildcard *.mjml)

OBJS=$(SRCS:.mjml=.html)

%.html: %.mjml
	../node_modules/.bin/mjml $< -o $@

all: $(OBJS)

.PHONY: clean
clean:
	rm -vf *.html
